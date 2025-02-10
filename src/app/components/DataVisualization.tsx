'use client'

import { Line } from 'react-chartjs-2'
import { ChartData } from '@/types'
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js'

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
)

interface DataVisualizationProps {
    chartData: ChartData | null
}

export default function DataVisualization({ chartData }: DataVisualizationProps) {
    if (!chartData) return null

    return (
        <div className="p-4 border rounded">
            <h2 className="text-xl mb-4">Data Visualization</h2>
            <Line data={chartData} />
        </div>
    )
} 