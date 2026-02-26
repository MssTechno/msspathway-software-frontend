import { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

function Leave() {
  const [open, setOpen] = useState(false);
  const [leaveType, setLeaveType] = useState("");
  const [singleDate, setSingleDate] = useState(null);
  const [from, setFrom] = useState(null);
  const [to, setTo] = useState(null);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  /* Listen to Apply Leave button click */
  useEffect(() => {
    const handler = (e) => {
      if (e.detail === "open-leave-modal") {
        setOpen(true);
      }
    };

    window.addEventListener("leave-event", handler);
    return () => window.removeEventListener("leave-event", handler);
  }, []);

  // Convert Date to YYYY-MM-DD
  const formatDate = (date) => {
    if (!date) return null;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const applyLeave = async () => {
    if (!leaveType || !reason) {
      alert("Please fill all required fields");
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      alert("Bad token.");
      return;
    }

    let payload = {
      leave_type:
        leaveType === "single" ? "one_day" : "multiple_days",
      leave_date: null,
      start_date: null,
      end_date: null,
      description: reason,
    };

    // Single Day Leave
    if (leaveType === "single") {
      if (!singleDate) {
        alert("Please select date");
        return;
      }
      payload.leave_date = formatDate(singleDate);
    }

    // Multiple Days Leave
    if (leaveType === "multiple") {
      if (!from || !to) {
        alert("Please select start and end date");
        return;
      }

      if (to < from) {
        alert("End date cannot be before start date");
        return;
      }

      payload.start_date = formatDate(from);
      payload.end_date = formatDate(to);
    }

    try {
      setLoading(true);
      const response = await fetch(
        "https://timesheet-api-790373899641.asia-south1.run.app/timesheet/Leaveapply", //API call
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token.trim()}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.log("Server Error:", errorText);
        throw new Error("Failed to apply leave");
      }

      const data = await response.json();
      console.log("Success:", data);

      alert("Leave Applied Successfully ✅");

      // Reset Form
      setOpen(false);
      setLeaveType("");
      setSingleDate(null);
      setFrom(null);
      setTo(null);
      setReason("");
    } catch (error) {
      console.error("Apply Leave Error:", error);
      alert("Something went wrong ❌");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <h3 className="font-semibold text-lg mb-4">
          Apply for Leave
        </h3>

        {/* Radio Buttons */}
        <div className="flex gap-6 mb-4">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              value="single"
              checked={leaveType === "single"}
              onChange={() => setLeaveType("single")}
            />
            1 Day Leave
          </label>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              value="multiple"
              checked={leaveType === "multiple"}
              onChange={() => setLeaveType("multiple")}
            />
            Multiple Days Leave
          </label>
        </div>

        {leaveType && (
          <div className="space-y-4">

            {/* Single Day */}
            {leaveType === "single" && (
              <div>
                <label className="block text-sm font-medium mb-1">
                  Date
                </label>
                {/* <input
                  type="date"
                  value={singleDate}
                  onChange={(e) => setSingleDate(e.target.value)}
                  className="w-full border p-2 rounded text-sm"
                /> */}
                
                <DatePicker
                  placeholderText="dd-mm-yyyy"
                  selected={singleDate}
                  onChange={(date) => setSingleDate(date)}
                  dateFormat="dd-MM-yyyy"
                  wrapperClassName="w-full"
                  className="w-full border p-2 rounded text-sm focus:ring-2 focus:ring-green-600 outline-none"
                  shouldCloseOnSelect={true}
                  closeOnScroll={false}
                  onClickOutside={(e) => e.preventDefault()}
                />
              </div>
            )}

            {/* Multiple Days */}
            {leaveType === "multiple" && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Start Date
                  </label>
                  {/* <input
                    type="date"
                    value={from}
                    onChange={(e) => setFrom(e.target.value)}
                    className="w-full border p-2 rounded text-sm"
                  /> */}

                  <DatePicker
                    placeholderText="dd-mm-yyyy"
                    selected={from}
                    onChange={(date) => setFrom(date)}
                    dateFormat="dd-MM-yyyy"
                    wrapperClassName="w-full"
                    className="w-full border p-2 rounded text-sm focus:ring-2 focus:ring-green-600 outline-none"
                    shouldCloseOnSelect={true}
                    closeOnScroll={false}
                    onClickOutside={(e) => e.preventDefault()}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    End Date
                  </label>
                  {/* <input
                    type="date"
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    className="w-full border p-2 rounded text-sm"
                  /> */}

                  <DatePicker
                    placeholderText="dd-mm-yyyy"
                    selected={to}
                    onChange={(date) => setTo(date)}
                    dateFormat="dd-MM-yyyy"
                    wrapperClassName="w-full"
                    className="w-full border p-2 rounded text-sm focus:ring-2 focus:ring-green-600 outline-none"
                    shouldCloseOnSelect={true}
                    closeOnScroll={false}
                    onClickOutside={(e) => e.preventDefault()}
                  />
                </div>
              </>
            )}

            {/* Description */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Description
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                className="w-full border p-2 rounded text-sm"
              />
            </div>
          </div>
        )}

        <div className="flex justify-end gap-4 mt-6">
          <button
            onClick={() => setOpen(false)}
            className="text-sm text-gray-500"
          >
            Cancel
          </button>

          <button
            onClick={applyLeave}
            disabled={!leaveType || loading}
            className="px-4 py-2 rounded text-sm bg-green-700 text-white"
          >
            {loading ? "Applying..." : "Apply Leave"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Leave;
