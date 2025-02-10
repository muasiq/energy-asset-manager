'use client'

import { useState } from 'react'
import { AssetData } from '@/types'

interface DataFormProps {
    onSubmit: (data: AssetData) => void
}

export default function DataForm({ onSubmit }: DataFormProps) {
    const [formData, setFormData] = useState<AssetData>({
        assetName: '',
        feature: '',
        unit: '',
        lowerBound: 0,
        upperBound: 100,
        intervalMinutes: 5,
        days: 1
    })

    return (
        <div className="p-4 border rounded">
            <h2 className="text-xl mb-4">Generate Data</h2>
            <form className="space-y-4" onSubmit={(e) => {
                e.preventDefault()
                onSubmit(formData)
            }}>
                <div>
                    <label className="block mb-1">Asset Name</label>
                    <input
                        type="text"
                        className="w-full border p-2 rounded"
                        value={formData.assetName}
                        onChange={(e) => setFormData({...formData, assetName: e.target.value})}
                        required
                    />
                </div>
                <div>
                    <label className="block mb-1">Feature</label>
                    <input
                        type="text"
                        className="w-full border p-2 rounded"
                        value={formData.feature}
                        onChange={(e) => setFormData({...formData, feature: e.target.value})}
                        required
                    />
                </div>
                <div>
                    <label className="block mb-1">Unit</label>
                    <input
                        type="text"
                        className="w-full border p-2 rounded"
                        value={formData.unit}
                        onChange={(e) => setFormData({...formData, unit: e.target.value})}
                        required
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block mb-1">Lower Bound</label>
                        <input
                            type="number"
                            className="w-full border p-2 rounded"
                            value={formData.lowerBound}
                            onChange={(e) => setFormData({...formData, lowerBound: Number(e.target.value)})}
                            required
                        />
                    </div>
                    <div>
                        <label className="block mb-1">Upper Bound</label>
                        <input
                            type="number"
                            className="w-full border p-2 rounded"
                            value={formData.upperBound}
                            onChange={(e) => setFormData({...formData, upperBound: Number(e.target.value)})}
                            required
                        />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block mb-1">Interval (minutes)</label>
                        <input
                            type="number"
                            className="w-full border p-2 rounded"
                            value={formData.intervalMinutes}
                            onChange={(e) => setFormData({...formData, intervalMinutes: Number(e.target.value)})}
                            required
                        />
                    </div>
                    <div>
                        <label className="block mb-1">Days of Data</label>
                        <input
                            type="number"
                            className="w-full border p-2 rounded"
                            value={formData.days}
                            onChange={(e) => setFormData({...formData, days: Number(e.target.value)})}
                            required
                        />
                    </div>
                </div>
                <button
                    type="submit"
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                >
                    Generate Data
                </button>
            </form>
        </div>
    )
} 