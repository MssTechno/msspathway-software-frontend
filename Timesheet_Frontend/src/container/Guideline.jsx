import { Info } from "lucide-react";

function Guideline() {
  return (
    <div className="bg-[#f4efe9] p-5 rounded-xl">
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <Info size={16} className="text-green-700" />
        <p className="font-semibold text-gray-900">Guideline</p>
      </div>

      {/* Text */}
      <p className="text-sm text-gray-600">
        Please ensure all hours for the current day are submitted by
        <strong> 11:59 PM EST</strong> for approval processing.
      </p>
    </div>
  );
}

export default Guideline;
