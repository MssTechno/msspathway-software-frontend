import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";

const weekDays = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

function Calender({ selectedDate, onDateSelect }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [hoursMap, setHoursMap] = useState({});
  const [loading, setLoading] = useState(false);

  const year = currentDate.getFullYear();
  const monthIndex = currentDate.getMonth(); //0-11
  const month = monthIndex + 1; //1-12

  /*Fetch calendar data on month/year change */
  useEffect(() => {
    fetchCalendarData();
  }, [month, year]);

  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     fetchCalendarData();
  //   }, 10000); // every 10 seconds

  //   return () => clearInterval(interval);
  // }, [month, year]);

  useEffect(() => {
    const refreshCalendar = () => {
      fetchCalendarData();
    };

    window.addEventListener("timesheetSubmitted", refreshCalendar);

    return () => {
      window.removeEventListener("timesheetSubmitted", refreshCalendar);
    };
  }, []);

  const fetchCalendarData = async () => {
    try {
      setLoading(true);

      console.log("Calling API with:", month, year);

      const response = await fetch(
        `https://timesheet-api-790373899641.asia-south1.run.app/calendar/date-range?month=${month}&year=${year}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            // Add Authorization if required
            "Authorization": `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Calendar API Response:", data);

      // if (!data.date) {
      //   console.error("API did not return array:", data);
      //   setHoursMap({});
      //   return;
      // }

      /* Convert API object into simple hours map */
      const formattedMap = {};

      const calendarData = data.date || {};

      Object.entries(calendarData).forEach(([key, entry]) => {
        if(!entry) return;

        if (entry.status === "leave") {
          formattedMap[key] = "leave";
        } else if (entry.status === "pending") {
          formattedMap[key] = "pending";
        }else if (entry.status === "publicholiday") {
          formattedMap[key] = "publicholiday";
        } else {
          formattedMap[key] = entry.hours || 0;
        }
      });

      setHoursMap(formattedMap);
    } 
    
    catch (error) {
      console.error("Error fetching calendar data:", error);
    } 
    
    finally {
      setLoading(false);
    }
  };

  const firstDay = new Date(year, monthIndex, 1);
  const lastDate = new Date(year, monthIndex + 1, 0).getDate();
  const startDay = (firstDay.getDay() + 6) % 7;

  const prevMonth = () => setCurrentDate(new Date(year, monthIndex - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, monthIndex + 1, 1));

  const dateKey = (d) => {
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const isSameDay = (d1, d2) =>
    d1 && d2 && d1.toDateString() === d2.toDateString();

  const isWeekend = (date) =>
    date.getDay() === 0 || date.getDay() === 6;

  /* Weekly progress */
  const getWeekHours = () => {
    if (!selectedDate) return 0;

    const start = new Date(selectedDate);
    start.setDate(start.getDate() - ((start.getDay() + 6) % 7));

    let total = 0;
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);

      if (isWeekend(d)) continue;

      const val = hoursMap[dateKey(d)];
      if (val === "leave") continue;

      const h = parseFloat(val);
      if (!isNaN(h)) total += h;
    }
    return total;
  };

  const weeklyHours = getWeekHours();
  const weeklyTarget = 40;
  const progressPercent = Math.min(
    (weeklyHours / weeklyTarget) * 100,
    100
  );

  return (
    <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm w-full">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-semibold text-lg">
          {currentDate.toLocaleString("default", { month: "long" })} {year}
        </h2>
        <div className="flex gap-2">
          <button onClick={prevMonth}>
            <ChevronLeft size={18} />
          </button>
          <button onClick={nextMonth}>
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Weekdays */}
      <div className="grid grid-cols-7 text-xs text-gray-400 text-center mb-2">
        {weekDays.map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>

      {/* Calendar Dates */}
      <div className="grid grid-cols-7 gap-3 text-center">
        {[...Array(startDay)].map((_, i) => (
          <div key={i} />
        ))}

        {[...Array(lastDate)].map((_, i) => {
          const date = new Date(year, monthIndex, i + 1);
          const key = dateKey(date);
          const weekend = isWeekend(date);
          const value = hoursMap[key];
          const selected = isSameDay(date, selectedDate);

          let bg = "bg-white border-gray-200";
          let label = "0h";

          if (weekend) {
            bg = "bg-gray-100 border-gray-400 text-gray-400";
          } 
          else if (value === "leave") {
            bg = "bg-red-50 border-red-200 text-red-600";
            label = "leave";
          } 
          else if (value === "pending") {
            bg = "bg-gray-100 border-gray-400 text-gray-400";
            label = "pending";
          } 
          else if (value === "publicholiday") {
            bg = "bg-blue-100 border-blue-300 text-blue-700";
            label = "public hol";
          } 
          else if (Number(value) >= 8) {
            bg = "bg-green-50 border-green-200 text-green-700";
            label = `${value}h`;
          } 
          else if (Number(value) > 0) {
            bg = "bg-yellow-50 border-yellow-200 text-yellow-700";
            label = `${value}h`;
          }

          return (
            <div
              key={i}
              onClick={() =>
                onDateSelect({
                  date,
                  status: value
                })
              }
              className={`flex flex-col items-center justify-center min-h-[64px] sm:min-h-[72px] rounded-lg border text-sm leading-none
                ${bg}
                ${selected ? "ring-2 ring-green-600" : ""}
                ${
                  weekend
                    ? "cursor-not-allowed"
                    : "cursor-pointer hover:bg-gray-100"
                }
              `}
            >
              {i + 1}
              <div className="text-[10px] mt-1 font-medium">{label}</div>
            </div>
          );
        })}
      </div>

      {/* Divider */}
      <hr className="my-6 border-gray-200" />

      {/* Legend */}
      <div className="grid grid-cols-2 gap-3 text-xs text-gray-600">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded bg-green-100 border"></span>
          Filled
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded bg-yellow-100 border"></span>
          Partially Filled
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded bg-white border"></span>
          Not Filled
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded bg-red-100 border"></span>
          Leave
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded bg-blue-100 border"></span>
          Public Holiday
        </div>
      </div>

      {/* Divider */}
      <hr className="my-6 border-gray-200" />

      {/* Weekly Progress */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <p className="text-sm font-medium text-gray-700">
            Weekly Progress
          </p>
          <p className="text-sm font-semibold">
            {weeklyHours.toFixed(1)} / {weeklyTarget}h
          </p>
        </div>

        <div className="w-full bg-gray-200 h-2 rounded-full">
          <div
            className="bg-green-700 h-2 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <p className="text-xs text-gray-400 mt-2">
          You need {(weeklyTarget - weeklyHours).toFixed(1)} more hours
          to reach your weekly target.
        </p>
      </div>

      <hr className="my-3 border-gray-200" />

      <button
        onClick={() =>
          window.dispatchEvent(
            new CustomEvent("leave-event", {
              detail: "open-leave-modal",
            })
          )
        }
        className="w-full mt-6 bg-green-700 text-white font-medium shadow-md py-3 rounded-xl hover:bg-green-800">
        Apply for Leave
      </button>
    </div>
  );
}
export default Calender;
