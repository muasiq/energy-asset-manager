import { InfluxDB } from '@influxdata/influxdb-client'

export const token = process.env.INFLUXDB_TOKEN
export const url = process.env.INFLUXDB_URL || 'http://localhost:8086'
export const org = process.env.INFLUXDB_ORG
export const bucket = 'energy_data'

export const getInfluxDB = () => {
    if (!token || !org) {
        throw new Error('InfluxDB configuration missing')
    }
    return new InfluxDB({ url, token })
}

export interface AssetData {
    assetName: string
    feature: string
    unit: string
    lowerBound: number
    upperBound: number
    intervalMinutes: number
    days: number
}

export interface ChartData {
    labels: string[]
    datasets: {
        label: string
        data: number[]
        borderColor: string
        tension: number
    }[]
}

export interface AnalysisResult {
    data: any[]
    anomalies: number[]
    suggestions: string[]
    statistics: {
        mean: number
        std: number
    }
}
