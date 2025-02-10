import { NextResponse } from 'next/server'
import { InfluxDB } from '@influxdata/influxdb-client'
import { OrgsAPI, BucketsAPI } from '@influxdata/influxdb-client-apis'

export async function GET() {
    try {
        const token = process.env.NEXT_PUBLIC_INFLUXDB_TOKEN
        const url = process.env.NEXT_PUBLIC_INFLUXDB_URL || 'http://localhost:8086'
        const org = process.env.NEXT_PUBLIC_INFLUXDB_ORG
        const bucket = 'energy_data'

        console.log('Starting setup with:', {
            hasToken: !!token,
            url,
            org,
            bucket
        })

        if (!token || !org) {
            return NextResponse.json({
                success: false,
                error: 'Missing InfluxDB configuration'
            })
        }

        const client = new InfluxDB({ url, token })
        
        // Get organization ID
        const orgsApi = new OrgsAPI(client)
        console.log('Fetching organization...')
        
        const organizations = await orgsApi.getOrgs()
        const orgID = organizations.orgs.find(o => o.name === org)?.id

        if (!orgID) {
            console.error('Organization not found:', org)
            return NextResponse.json({
                success: false,
                error: `Organization "${org}" not found`
            })
        }

        console.log('Found organization:', { org, orgID })

        // Create bucket
        const bucketsApi = new BucketsAPI(client)
        
        try {
            console.log('Creating bucket:', bucket)
            const newBucket = await bucketsApi.postBuckets({
                body: {
                    orgID,
                    name: bucket,
                    retentionRules: [{
                        type: 'expire',
                        everySeconds: 30 * 24 * 60 * 60 // 30 days
                    }]
                }
            })

            console.log('Bucket created successfully:', newBucket.name)

            return NextResponse.json({
                success: true,
                message: 'InfluxDB setup completed successfully',
                details: {
                    org,
                    orgID,
                    bucket: newBucket.name,
                    url
                }
            })

        } catch (bucketError: any) {
            // If bucket already exists, that's fine
            if (bucketError?.message?.includes('bucket already exists')) {
                console.log('Bucket already exists:', bucket)
                return NextResponse.json({
                    success: true,
                    message: 'Bucket already exists',
                    details: {
                        org,
                        orgID,
                        bucket,
                        url
                    }
                })
            }
            
            throw bucketError
        }

    } catch (error) {
        console.error('Setup failed:', error)
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            details: error instanceof Error ? {
                name: error.name,
                message: error.message,
                stack: error.stack
            } : null
        })
    }
}