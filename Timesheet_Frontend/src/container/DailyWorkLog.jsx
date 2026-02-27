import { use, useEffect, useState } from "react";
import { Save, Calendar as CalendarIcon, Edit, Trash } from "lucide-react";

const MAX_ENTRIES = 5;
const BASE_URL = "https://timesheet-api-790373899641.asia-south1.run.app/timesheet";

function DailyWorkLog({ selectedDate }) {
  if (!selectedDate) return null;

  const userId = localStorage.getItem("user_id");

  const dateKey = selectedDate.getFullYear() +
    "-" +
    String(selectedDate.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(selectedDate.getDate()).padStart(2, "0");

  const isWeekend = selectedDate.getDay() === 0 || selectedDate.getDay() === 6;

  const emptyForm = {
    project: "",
    category: "",
    breakTime: "",
    startTime: "",
    endTime: "",
    description: "",
  };

  const [formData, setFormData] = useState(emptyForm);
  const [entries, setEntries] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState(null);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  /*FETCH DRAFTS BY DATE*/
  useEffect(() => {
    const fetchDrafts = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const response = await fetch(
          `${BASE_URL}/draft/${dateKey}`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) throw new Error("Failed to fetch drafts");

        const data = await response.json();
        console.log("Draft fetch:", data);

        const formatted = data.map((item) => ({
          project: item.project_name,
          category: item.task_name,
          startTime: item.start_time?.slice(0, 5),
          endTime: item.end_time?.slice(0, 5),
          breakTime: item.break_time,
          description: "",
          draft_id: item.id || item.draft_id,   //STORE DRAFT ID
          hours: calculateHours(
            item.start_time?.slice(0, 5),
            item.end_time?.slice(0, 5),
            item.break_time
          ),
          status: "Draft",
        }));

        setEntries(formatted);

        const submittedKey = `submitted-${userId}-${dateKey}`;
        const savedSubmitted = localStorage.getItem(submittedKey);

        if (savedSubmitted === "true") {
          setSubmitted(true);
        } else {
          setSubmitted(false);
        }
      } catch (error) {
        setEntries([]);
      }
    };

    fetchDrafts();
    setFormData(emptyForm);
    setEditIndex(null);
  }, [dateKey, userId]);

  /*CALCULATE HOURS*/
  const calculateHours = (start, end, breakMin) => {
    if (!start || !end) return 0;
    const s = new Date(`1970-01-01T${start}`);
    const e = new Date(`1970-01-01T${end}`);
    let mins = (e - s) / 60000;
    mins -= Number(breakMin || 0);
    return (mins / 60).toFixed(1);
  };

  /*SAVE / UPDATE*/
  const saveLog = async (e) => {
    e.preventDefault();
    if (submitted || isWeekend) return;

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Invalid token");
      return;
    }

    if (
      !formData.project.trim() ||
      !formData.category.trim() ||
      !formData.startTime ||
      !formData.endTime ||
      !formData.description.trim()
    ) {
      alert("Please fill mandatory fields");
      return;
    }

    const hours = calculateHours(
      formData.startTime,
      formData.endTime,
      formData.breakTime
    );

    if (hours <= 0) {
      alert("Invalid time range");
      return;
    }

    const payload = {
      project_name: formData.project,
      task_name: formData.category,
      start_time: `${formData.startTime}:00`,
      end_time: `${formData.endTime}:00`,
      break_time: Number(formData.breakTime || 0),
      description: formData.description,
      work_date: dateKey,
      user_id: userId,
    };

    try {
      setLoading(true);

      let response;

      /*UPDATE*/
      if (editIndex !== null) {
        const draftId = entries[editIndex].draft_id;

        response = await fetch(
          `${BASE_URL}/update/${draftId}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
          }
        );
      }

      /*CREATE*/
      else {
        response = await fetch(
          `${BASE_URL}/create_draft`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
          }
        );
      }

      if (!response.ok) throw new Error("Save failed ❌");

      const data = await response.json();

      console.log("Create API Response:", data);

      const updated = [...entries];

      const record = {
        ...formData,
        hours,
        status: "Draft",
        draft_id:
          editIndex !== null
            ? entries[editIndex].draft_id
            : data.draft_id || data.id,   // STORE DRAFT ID
      };

      if (editIndex !== null) {
        updated[editIndex] = record;
      } else {
        updated.push(record);
      }

      setEntries(updated);
      setFormData(emptyForm);
      setEditIndex(null);

      alert(editIndex !== null ? "Timesheet updated successfully ✅" : "Timesheet saved successfully ✅");
    } catch (error) {
      alert("Error saving timesheet ❌");
    } finally {
      setLoading(false);
    }
  };

  /*DELETE*/
  const deleteEntry = async (index) => {
    if (submitted || isWeekend) return;

    const token = localStorage.getItem("token");
    const draftId = entries[index].draft_id;

    try {
      const response = await fetch(
        `${BASE_URL}/delete/${draftId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      console.log("Delete API Response:", data);

      const updated = entries.filter((_, i) => i !== index);
      setEntries(updated);

      alert("Timesheet Deleted ✅");
    } catch (error) {
      console.error("Delete error:", error);
      alert("Delete failed ❌");
    }
  };

  /*SUBMIT DAY*/
  const submitDay = async () => {
    if (isWeekend) return;

    const token = localStorage.getItem("token");

    try {
      const response = await fetch(
        `${BASE_URL}/submit`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            work_date: dateKey,
          }),
        }
      );

      const data = await response.json();

      console.log("Submit response status:", response.status);
      console.log("Submit data:", data);

      if (response.ok) {
        setSubmitted(true);
        localStorage.setItem(`submitted-${userId}-${dateKey}`, "true");
        alert("Day Submitted Successfully ✅");
        return;
      } else {
        alert(data.details || "Submit failed ❌");
      }

    } catch (error) {
      console.error("Submit error:", error);
      alert("Submit failed ❌");
    }
  };

  const editEntry = (index) => {
    if (submitted) return;
    setFormData(entries[index]);
    setEditIndex(index);
  };

  const confirmDelete = async () => {
    await deleteEntry(deleteIndex);
    setShowDeleteModal(false);
    setDeleteIndex(null);
  };

  const confirmSubmit = async () => {
    await submitDay();
    setShowSubmitModal(false);
  };

  const totalHours = entries.reduce(
    (sum, e) => sum + Number(e.hours || 0),
    0
  );

  return (
    <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 lg:p-8 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-2">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
          Daily Work Log
        </h2>
        <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
          <CalendarIcon size={16} className="text-green-700" />
          <span>
            {selectedDate.toLocaleDateString("en-US", {
              weekday: "long",
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}
          </span>
        </div>
      </div>

      {/* FORM */}
      <div className={`space-y-6 ${isWeekend ? "opacity-50 pointer-events-none" : ""}`}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Project Name
            </label>
            <input
              value={formData.project}
              onChange={(e) =>
                setFormData({ ...formData, project: e.target.value })
              }
              placeholder="Project Name *"
              className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-3 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Task Category
            </label>
            <input
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              placeholder="Task Category *"
              className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-3 text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Time
            </label>
            <input
              type="time"
              value={formData.startTime}
              onChange={(e) =>
                setFormData({ ...formData, startTime: e.target.value })
              }
              className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-3 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Time
            </label>
            <input
              type="time"
              value={formData.endTime}
              onChange={(e) =>
                setFormData({ ...formData, endTime: e.target.value })
              }
              className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-3 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Break (min)
            </label>
            <input
              placeholder="Break (min)"
              value={formData.breakTime}
              onChange={(e) =>
                setFormData({ ...formData, breakTime: e.target.value })
              }
              className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-3 text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Task Description
          </label>
          <textarea
            rows={4}
            placeholder="What have you achieved today? *"
            value={formData.description}
            required
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-3 text-sm resize-none"
          />
        </div>
      </div>

      {/* Actions */}
      {!isWeekend && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-14 mt-8">
          {!submitted && (
            <button
              onClick={saveLog}
              className={`flex items-center justify-center gap-2 px-6 py-4 rounded-xl text-sm w-full sm:max-w-[180px] text-white
            ${editIndex !== null
                  ? "bg-green-700 hover:bg-green-800"
                  : "bg-green-700 hover:bg-green-800"}`}
            >
              <Save size={20} />
              {editIndex !== null ? "Update" : "Save Timesheet"}
            </button>
          )}

          <button
            onClick={() => {
              setFormData(emptyForm);
              setEditIndex(null);   // exit edit mode
            }}
            className="text-gray-400 text-sm"
          >
            {editIndex !== null ? "Cancel Edit" : "Reset"}
          </button>
        </div>
      )}

      {/* WEEKEND NOTICE */}
      {isWeekend && (
        <div className="bg-green-50 border-l-4 border-green-600 text-black-700 p-4 mt-6" role="alert">
          <p className="font-semibold">Weekend Notice</p>
          <p className="text-sm">Timesheet entries cannot be added or edited for weekends.</p>
        </div>
      )}

      {/* LOGGED ACTIVITIES */}
      <div className="mt-8">
        <div className="flex justify-between mb-3">
          <h3 className="font-semibold">Logged Activities</h3>
          <span className="text-green-600">{totalHours} hrs Total</span>
        </div>

        {entries.length === 0 && (
          <p className="text-sm text-gray-400 py-6 text-center">
            No logged activities for this day
          </p>
        )}

        {entries.map((e, i) => (
          <div
            key={i}
            className="border border-gray-200 rounded-xl p-4 mb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          >
            <div>
              <div className="font-semibold">{e.project}</div>
              <div className="text-sm text-gray-500">
                {e.category} | {e.startTime} - {e.endTime}
              </div>
            </div>

            {!submitted && !isWeekend && (
              <div className="flex gap-3 self-end sm:self-auto">
                <button onClick={() => editEntry(i)} className="text-gray-400 hover:text-gray-600 transition" title="Edit"><Edit size={18} /></button>
                <button onClick={() => {setDeleteIndex(i); setShowDeleteModal(true);}} className="text-gray-400 hover:text-gray-600 transition" title="Delete"><Trash size={18} /> </button>
              </div>
            )}
          </div>
        ))}

        {submitted && (
          <div className="text-green-600 font-semibold mt-4 text-center">
            Day Submitted ✅
          </div>
        )}

        {!submitted && !isWeekend && entries.length > 0 && (
          <button
            onClick={() => setShowSubmitModal(true)}
            className="bg-green-700 text-white px-6 py-3 rounded-xl mt-4 w-full hover:bg-green-800"
          >
            Submit Day
          </button>
        )}

        {/* DELETE MODAL */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center px-4">
            <div className="bg-white w-full max-w-xs sm:max-w-[320px] p-5 sm:p-6 rounded-lg shadow-lg text-center">
              <h2 className="text-lg font-semibold mb-2 text-gray-900">Delete Draft</h2>
              <p className="mb-4 text-gray-600">
                Are you sure you want to delete this draft?
              </p>
              <div className="flex justify-end gap-6">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="text-gray-500"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="bg-green-700 text-white px-6 py-2 rounded-lg"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* SUBMIT MODAL */}
        {showSubmitModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center px-4">
            <div className="bg-white w-full max-w-xs sm:max-w-[320px] p-5 sm:p-6 rounded-lg shadow-lg text-center">
              <h3 className="text-lg font-semibold mb-2 text-gray-900">Submit Day</h3>
              <p className="mb-4 text-gray-600">
                Are you sure you want to submit the day?
              </p>
              <div className="flex justify-end gap-6">
                <button
                  onClick={() => setShowSubmitModal(false)}
                  className="text-gray-500"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmSubmit}
                  className="bg-green-700 text-white px-6 py-2 rounded-lg"
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DailyWorkLog;

