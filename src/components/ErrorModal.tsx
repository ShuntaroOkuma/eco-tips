interface Props {
  error: string;
  onClose: () => void;
}

export default function ErrorModal({ error, onClose }: Props) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
        <h3 className="text-xl font-bold text-red-600 mb-4">エラーが発生しました</h3>
        <p className="text-gray-700 mb-6">{error}</p>
        <button
          onClick={onClose}
          className="w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600"
        >
          閉じる
        </button>
      </div>
    </div>
  );
}