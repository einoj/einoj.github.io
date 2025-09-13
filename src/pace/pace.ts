class Race {
        name: string;
        length: number; // in meters

        constructor(name: string, length: number) {
            this.name = name;
            this.length = length;
        }
}

let race_list = [
        new Race("200m", 200),
        new Race("400m", 400),
        new Race("800m", 800),
        new Race("1000m", 1000),
        new Race("1200m", 1200),
        new Race("1600m", 1600),
        new Race("Mile", 1609.344),
        new Race("2km", 2000),
        new Race("3km", 3000),
        new Race("5km", 5000),
        new Race("10km", 10000),
        new Race("Half-Marathon",	21100)
];

function calculate_finish_time(minutes: number, seconds: number, len: number) {
    let seconds_per_m = (minutes*60+seconds)/1000;
    return len*seconds_per_m;
}

function add_leading_zero(time: number) {
    if (time < 10) {
        return "0";
    }
    return "";
}

function generate_pace(e: Event) {
    if ((e.target as HTMLElement).id === "minutes") {
        let minutes = parseInt((e.target as HTMLInputElement).value);
        let seconds = parseInt((<HTMLInputElement>document.getElementById("seconds")).value);
        let range_val = seconds+minutes*60;
        (<HTMLInputElement>document.getElementById("time_range")).value = String(range_val);
    } else if ((e.target as HTMLElement).id === "seconds")  {
        // TODO implement roll over
    } else if ((e.target as HTMLElement).id === "time_range") {
        let range_val = parseInt((e.target as HTMLInputElement).value);
        let minutes = Math.floor(range_val/60);
        let seconds = range_val-minutes*60;
        (<HTMLInputElement>document.getElementById("minutes")).value = String(minutes);
        (<HTMLInputElement>document.getElementById("seconds")).value = String(seconds);
    }
    const minutes = Number((<HTMLInputElement>document.getElementById("minutes")).value)
    const seconds = Number((<HTMLInputElement>document.getElementById("seconds")).value)
    const tableData = race_list.map(race => {
    let finish_time = calculate_finish_time(minutes, seconds, race.length);
    const finish_hours = Math.floor(finish_time/60/60);
    finish_time = finish_time - finish_hours*60*60;
    const finish_minutes = Math.floor(finish_time/60);
    finish_time = finish_time - finish_minutes*60;
    const finish_seconds = Math.round(finish_time);
    const leading_0_sec = add_leading_zero(finish_seconds);
    const leading_0_min= add_leading_zero(finish_minutes);

    if (finish_hours > 0) {
        return (
        `<tr>
           <td>${race.name}</td>
           <td>${finish_hours}:${leading_0_min}${finish_minutes}:${leading_0_sec}${finish_seconds}</td>
        </tr>`
      );
    } else {
        return (
        `<tr>
           <td>${race.name}</td>
           <td>${leading_0_min}${finish_minutes}:${leading_0_sec}${finish_seconds}</td>
        </tr>`
      );
    }
    }).join('');
    document.getElementById("tableBody").innerHTML = tableData;
}

var numseconds = document.getElementById("seconds");
numseconds.addEventListener("input", generate_pace);
document.getElementById("time_range").addEventListener("input", generate_pace);
// create an initial event to populate the table
var init_event = new Event("input", {
    bubbles: true,
});
numseconds.dispatchEvent(init_event);
var numminutes = document.getElementById("minutes");
numminutes.addEventListener("input", generate_pace);
document.getElementById("time_range").addEventListener("input", generate_pace);
// create an initial event to populate the table
var init_event = new Event("input", {
    bubbles: true,
});
numminutes.dispatchEvent(init_event);
