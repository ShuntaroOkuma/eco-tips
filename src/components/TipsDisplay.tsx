interface Props {
  tips: string[];
}

export default function TipsDisplay({ tips }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {tips.map((tip, index) => (
        <div
          key={index}
          className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
        >
          <p className="text-gray-800">{tip}</p>
        </div>
      ))}
    </div>
  );
}