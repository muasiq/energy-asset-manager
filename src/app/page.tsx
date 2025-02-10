'use client'

import { useState, useEffect } from 'react'
import { Line } from 'react-chartjs-2'
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

const TIME_WINDOWS = [
    { label: 'Last Hour', value: '1h' },
    { label: '3 Hours', value: '3h' },
    { label: '1 Day', value: '1d' },
    { label: '7 Days', value: '7d' },
    { label: 'Since Inception', value: 'all' }
]

export default function Home() {
    // Add state declarations at the top
    const [assetName, setAssetName] = useState('')
    const [feature, setFeature] = useState('')
    const [unit, setUnit] = useState('')
    const [lowerBound, setLowerBound] = useState('')
    const [upperBound, setUpperBound] = useState('')
    const [timeWindow, setTimeWindow] = useState('1h')
    const [chartData, setChartData] = useState<any>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    // Function to fetch and update data
    const fetchData = async () => {
        if (!assetName || !feature) return;

        try {
            const response = await fetch('/api/data/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    assetName,
                    feature,
                    timeRange: timeWindow
                })
            })

            const result = await response.json()

            if (!response.ok || !result.success) {
                throw new Error(result?.error || 'Failed to fetch data')
            }

            // Format data for Chart.js
            const formattedData = {
                labels: result.data.map((point: any) => 
                    new Date(point.time).toLocaleTimeString()
                ),
                datasets: [{
                    label: `${feature} (${unit})`,
                    data: result.data.map((point: any) => point.value),
                    borderColor: 'rgb(75, 192, 192)',
                    tension: 0.1
                }]
            }

            setChartData(formattedData)
            setError('')
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch data')
        }
    }

    // Real-time updates
    useEffect(() => {
        if (assetName && feature) {
            fetchData()
            const interval = setInterval(fetchData, 5000)
            return () => clearInterval(interval)
        }
    }, [assetName, feature, timeWindow])

    const handleGenerateData = async () => {
        if (!assetName || !feature || !unit || !lowerBound || !upperBound) {
            setError('Please fill in all fields')
            return
        }

        setLoading(true)
        setError('')

        try {
            const generateResponse = await fetch('/api/data/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    assetName,
                    feature,
                    unit,
                    lowerBound: Number(lowerBound),
                    upperBound: Number(upperBound),
                    intervalMinutes: 1
                })
            })

            const generateResult = await generateResponse.json()

            if (!generateResponse.ok || !generateResult.success) {
                throw new Error(generateResult?.error || 'Failed to generate data')
            }

            await fetchData()
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to generate data')
        } finally {
            setLoading(false)
        }
    }

    return (
        <main className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Energy Data Generator</h1>
            
            <div className="mb-8 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                        type="text"
                        value={assetName}
                        onChange={(e) => setAssetName(e.target.value)}
                        placeholder="Asset Name"
                        className="border p-2 rounded"
                        required
                    />
                    <input
                        type="text"
                        value={feature}
                        onChange={(e) => setFeature(e.target.value)}
                        placeholder="Feature (e.g., temperature)"
                        className="border p-2 rounded"
                        required
                    />
                    <input
                        type="text"
                        value={unit}
                        onChange={(e) => setUnit(e.target.value)}
                        placeholder="Unit (e.g., celsius)"
                        className="border p-2 rounded"
                        required
                    />
                    <input
                        type="number"
                        value={lowerBound}
                        onChange={(e) => setLowerBound(e.target.value)}
                        placeholder="Lower Bound"
                        className="border p-2 rounded"
                        required
                    />
                    <input
                        type="number"
                        value={upperBound}
                        onChange={(e) => setUpperBound(e.target.value)}
                        placeholder="Upper Bound"
                        className="border p-2 rounded"
                        required
                    />
                </div>
                
                <button
                    onClick={handleGenerateData}
                    disabled={loading}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
                >
                    {loading ? 'Generating...' : 'Generate Data'}
                </button>
            </div>

            {error && (
                <div className="text-red-500 mb-4">
                    Error: {error}
                </div>
            )}

            <div className="mb-4">
                <label className="block mb-2">Time Window:</label>
                <select
                    value={timeWindow}
                    onChange={(e) => setTimeWindow(e.target.value)}
                    className="border p-2 rounded"
                >
                    {TIME_WINDOWS.map(option => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            </div>

            {chartData && (
                <div className="mt-8">
                    <Line
                        data={chartData}
                        options={{
                            responsive: true,
                            plugins: {
                                legend: {
                                    position: 'top' as const,
                                },
                                title: {
                                    display: true,
                                    text: `${feature} Data for ${assetName}`
                                }
                            },
                            scales: {
                                x: {
                                    title: {
                                        display: true,
                                        text: 'Time'
                                    }
                                },
                                y: {
                                    title: {
                                        display: true,
                                        text: unit
                                    }
                                }
                            }
                        }}
                    />
                </div>
            )}
        </main>
    )
}