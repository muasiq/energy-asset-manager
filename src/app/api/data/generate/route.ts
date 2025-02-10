import { NextResponse } from 'next/server'
import { InfluxDB, Point } from '@influxdata/influxdb-client'

const token = process.env.NEXT_PUBLIC_INFLUXDB_TOKEN
const url = process.env.NEXT_PUBLIC_INFLUXDB_URL || 'http://localhost:8086'
const org = process.env.NEXT_PUBLIC_INFLUXDB_ORG
const bucket = 'energy_data'

export async function POST(req: Request) {
    try {
        // Validate InfluxDB configuration
        if (!token || !org) {
            console.error('Missing InfluxDB configuration:', { hasToken: !!token, hasOrg: !!org })
            return NextResponse.json({
                success: false,
                error: 'InfluxDB configuration missing',
                details: {
                    hasToken: !!token,
                    hasOrg: !!org,
                    url
                }
            }, { status: 500 })
        }

        // Parse request body
        const body = await req.json()
        const { 
            assetName, 
            feature, 
            unit, 
            lowerBound, 
            upperBound, 
            intervalMinutes = 5, 
            days = 1 
        } = body

        // Validate required fields
        if (!assetName || !feature || !unit) {
            return NextResponse.json({
                success: false,
                error: 'Missing required fields: assetName, feature, and unit'
            }, { status: 400 })
        }

        // Initialize InfluxDB client
        const client = new InfluxDB({ url, token })
        const writeApi = client.getWriteApi(org, bucket, 'ms')

        // Generate data points
        const currentTime = new Date()
        let startTime = new Date(currentTime.getTime() - (days * 24 * 60 * 60 * 1000))
        const points: Point[] = []

        while (startTime <= currentTime) {
            const value = lowerBound + Math.random() * (upperBound - lowerBound)
            
            const point = new Point(assetName)
                .floatField(feature, value)
                .tag('unit', unit)
                .timestamp(startTime)

            points.push(point)
            startTime = new Date(startTime.getTime() + (intervalMinutes * 60 * 1000))
        }

        // Write points to InfluxDB
        try {
            for (const point of points) {
                writeApi.writePoint(point)
            }
            await writeApi.flush()
            await writeApi.close()

            return NextResponse.json({
                success: true,
                message: 'Data generated successfully',
                pointsGenerated: points.length,
                timeRange: {
                    start: points[0].timestamp,
                    end: points[points.length - 1].timestamp
                }
            })

        } catch (writeError) {
            console.error('Error writing to InfluxDB:', writeError)
            return NextResponse.json({
                success: false,
                error: 'Failed to write data to InfluxDB',
                details: writeError instanceof Error ? writeError.message : 'Unknown error'
            }, { status: 500 })
        }

    } catch (error) {
        console.error('Error in generate route:', error)
        return NextResponse.json({ 
            success: false,
            error: 'Failed to generate data',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 })
    }
}