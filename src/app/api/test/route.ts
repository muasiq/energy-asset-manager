// import { NextResponse } from 'next/server'
// import { InfluxDB } from '@influxdata/influxdb-client'
// import { OrgsAPI, BucketsAPI } from '@influxdata/influxdb-client-apis'

// export async function GET() {
//     try {
//         const token = process.env.NEXT_PUBLIC_INFLUXDB_TOKEN
//         const url = process.env.NEXT_PUBLIC_INFLUXDB_URL || 'http://localhost:8086'
//         const org = process.env.NEXT_PUBLIC_INFLUXDB_ORG
//         const bucket = 'energy_data'

//         if (!token || !org) {
//             return NextResponse.json({
//                 success: false,
//                 error: 'Missing InfluxDB configuration'
//             })
//         }

//         const client = new InfluxDB({ url, token })
        
//         // Get organization ID
//         const orgsApi = new OrgsAPI(client)
//         const organizations = await orgsApi.getOrgs({ org })
//         const orgID = organizations.orgs[0]?.id

//         if (!orgID) {
//             return NextResponse.json({
//                 success: false,
//                 error: 'Organization not found'
//             })
//         }

//         // Create bucket if it doesn't exist
//         const bucketsApi = new BucketsAPI(client)
//         const buckets = await bucketsApi.getBuckets({
//             org,
//             name: bucket
//         })

//         if (buckets.buckets?.length === 0) {
//             await bucketsApi.postBuckets({
//                 body: {
//                     orgID,
//                     name: bucket,
//                     retentionRules: [{
//                         type: 'expire',
//                         everySeconds: 30 * 24 * 60 * 60 // 30 days
//                     }]
//                 }
//             })
//         }

//         return NextResponse.json({
//             success: true,
//             message: 'InfluxDB setup completed',
//             details: {
//                 org,
//                 orgID,
//                 bucket,
//                 url
//             }
//         })

//     } catch (error) {
//         console.error('Setup failed:', error)
//         return NextResponse.json({
//             success: false,
//             error: error instanceof Error ? error.message : 'Unknown error'
//         })
//     }
// }


import { NextResponse } from 'next/server'
import { InfluxDB } from '@influxdata/influxdb-client'

export async function GET() {
    try {
        const token = process.env.NEXT_PUBLIC_INFLUXDB_TOKEN
        const url = process.env.NEXT_PUBLIC_INFLUXDB_URL || 'http://localhost:8086'
        const org = process.env.NEXT_PUBLIC_INFLUXDB_ORG

        console.log('Testing connection with:', {
            hasToken: !!token,
            url,
            org
        })

        if (!token || !org) {
            return NextResponse.json({
                success: false,
                error: 'InfluxDB configuration missing',
                details: {
                    hasToken: !!token,
                    hasOrg: !!org,
                    url
                }
            })
        }

        // Initialize client
        const client = new InfluxDB({ url, token })
        const queryApi = client.getQueryApi(org)

        // Simple test query
        const query = `from(bucket:"energy_data")
            |> range(start: -1h)
            |> limit(n:1)`

        const result = await queryApi.collectRows(query)

        return NextResponse.json({
            success: true,
            message: 'InfluxDB connection successful',
            details: {
                url,
                org,
                hasData: result.length > 0
            }
        })

    } catch (error) {
        console.error('Connection test failed:', error)
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            details: error instanceof Error ? {
                name: error.name,
                message: error.message
            } : null
        })
    }
}