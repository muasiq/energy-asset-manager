interface SuggestionsProps {
    suggestions: string[]
}

export default function Suggestions({ suggestions }: SuggestionsProps) {
    return (
        <div className="p-4 border rounded">
            <h2 className="text-xl mb-4">Suggestions</h2>
            {suggestions.length === 0 ? (
                <p className="text-gray-500">No suggestions available yet.</p>
            ) : (
                <ul className="list-disc pl-4 space-y-2">
                    {suggestions.map((suggestion, index) => (
                        <li key={index} className="text-gray-700">{suggestion}</li>
                    ))}
                </ul>
            )}
        </div>
    )
} 