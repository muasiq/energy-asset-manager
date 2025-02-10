import { InfluxDB } from '@influxdata/influxdb-client'
import { NextResponse } from 'next/server'

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
                error: 'InfluxDB configuration missing'
            }, { status: 500 })
        }

        const { assetName, feature, timeRange = '1h' } = await req.json()
        
        if (!assetName || !feature) {
            return NextResponse.json({
                success: false,
                error: 'Missing required parameters: assetName and feature'
            }, { status: 400 })
        }

        const client = new InfluxDB({ url, token })
        const queryApi = client.getQueryApi(org)

        // Determine window period based on time range
        let windowPeriod = '1m'  // default 1 minute
        if (timeRange === '7d') {
            windowPeriod = '1h'  // 1 hour for 7 days
        } else if (timeRange === 'all') {
            windowPeriod = '1d'  // 1 day for all time
        } else if (timeRange === '1d') {
            windowPeriod = '15m' // 15 minutes for 1 day
        } else if (timeRange === '3h') {
            windowPeriod = '5m'  // 5 minutes for 3 hours
        }

        // Build the query with proper time range and aggregation
        let rangeFilter = ''
        if (timeRange === 'all') {
            rangeFilter = '|> range(start: 0)' // Since beginning
        } else {
            rangeFilter = `|> range(start: -${timeRange})`
        }

        const query = `
            from(bucket: "${bucket}")
                ${rangeFilter}
                |> filter(fn: (r) => r["_measurement"] == "${assetName}")
                |> filter(fn: (r) => r["_field"] == "${feature}")
                |> aggregateWindow(every: ${windowPeriod}, fn: mean, createEmpty: false)
                |> sort(columns: ["_time"])
        `

        console.log('Executing query:', query)

        const result = await queryApi.collectRows(query)
        
        // Calculate statistics
        const values = result.map(row => row._value)
        
        if (values.length === 0) {
            return NextResponse.json({
                success: false,
                error: 'No data found for the specified parameters'
            }, { status: 404 })
        }

        const mean = values.reduce((a, b) => a + b, 0) / values.length
        const std = Math.sqrt(
            values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length
        )

        // Detect anomalies (values outside 2 standard deviations)
        const anomalies = result.filter(row => 
            Math.abs(row._value - mean) > 2 * std
        ).map(row => ({
            time: row._time,
            value: row._value
        }))

        // Calculate additional statistics
        const min = Math.min(...values)
        const max = Math.max(...values)
        const range = max - min

        return NextResponse.json({
            success: true,
            data: result.map(row => ({
                time: row._time,
                value: row._value
            })),
            timeRange,
            statistics: {
                mean: mean.toFixed(2),
                std: std.toFixed(2),
                min: min.toFixed(2),
                max: max.toFixed(2),
                range: range.toFixed(2),
                count: values.length
            },
            anomalies: anomalies.length > 0 ? {
                count: anomalies.length,
                points: anomalies
            } : null,
            suggestions: generateSuggestions(anomalies, mean)
        })

    } catch (error) {
        console.error('Error analyzing data:', error)
        return NextResponse.json({ 
            success: false,
            error: 'Failed to analyze data',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 })
    }
}

function generateSuggestions(anomalies: any[], mean: number): string[] {
    if (anomalies.length === 0) {
        return ['No anomalies detected. System is operating normally.']
    }

    const suggestions = anomalies.map(anomaly => {
        const time = new Date(anomaly.time).toLocaleString()
        if (anomaly.value > mean) {
            return `High value (${anomaly.value.toFixed(2)}) detected at ${time}. Consider checking for equipment stress.`
        }
        return `Low value (${anomaly.value.toFixed(2)}) detected at ${time}. Consider checking for potential issues.`
    })

    if (anomalies.length > 5) {
        suggestions.push('Multiple anomalies detected. Consider scheduling a maintenance check.')
    }

    return suggestions
}