import { useState } from "react";
import Calender from "./Calender";
import DailyWorkLog from "./DailyWorkLog";
import Guideline from "./Guideline";
import Leave from "./Leave";

function Timesheet() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [refresh, setRefresh] = useState(0);

  return (
    <div className="w-full">
      {/* Body */}
      <div className="
        grid
        grid-cols-1
        lg:grid-cols-12
        gap-4
        md:gap-5
        lg:gap-6
        p-3
        sm:p-4
        md:p-5
        lg:p-8
      ">
        {/* LEFT PANEL */}
        <div className="
          col-span-12
          lg:col-span-4
          space-y-6
          md:space-y-5
          lg:space-y-6
        ">
          <Calender
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
          />
          <Leave />
          <Guideline />
        </div>

        {/* RIGHT PANEL */}
        <div className="
          col-span-12
          lg:col-span-8
          space-y-6
          md:space-y-5
          lg:space-y-6
        ">
          <DailyWorkLog selectedDate={selectedDate} />
        </div>
      </div>
    </div>
  );
}

export default Timesheet;
