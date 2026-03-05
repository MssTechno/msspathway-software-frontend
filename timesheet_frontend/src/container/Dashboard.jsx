import { useState } from "react";
import Calender from "./Calender";
import DailyWorkLog from "./DailyWorkLog";

function Dashboard() {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [hoursMap, setHoursMap] = useState({});

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Calender
                selectedDate={selectedDate}
                onDateSelect={setSelectedDate}
                hoursMap={hoursMap}
                setHoursMap={setHoursMap}
            />

            <DailyWorkLog
                selectedDate={selectedDate}
                hoursMap={hoursMap}
                setHoursMap={setHoursMap}
            />
        </div>
    );
}

export default Dashboard;