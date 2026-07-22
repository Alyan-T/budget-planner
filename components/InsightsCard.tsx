export function InsightsCard({
  insights,
  suggestion,
}: {
  insights: string[];
  suggestion: string;
}) {
  return (
    <div className="bg-white border rounded-xl p-4">
      <h3 className="font-medium mb-2">AI insights</h3>
      <ul className="space-y-1 text-sm text-gray-700 list-disc pl-4">
        {insights.map((i, idx) => (
          <li key={idx}>{i}</li>
        ))}
      </ul>
      <p className="text-sm mt-3 bg-gray-50 rounded-lg p-2">{suggestion}</p>
    </div>
  );
}
