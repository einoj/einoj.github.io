class Ingridient {
        name: string;
        value: number;
        unit: string;

        constructor(name: string, value: number, unit?: string) {
            this.name = name;
            this.value = value;
            if (unit !== undefined) {
                this.unit = unit;
            } else {
                this.unit = "";
            }
        }
}

let ingridient_list = [
        new Ingridient("Kjøttdeig", 200, "g"),
        new Ingridient("Ost", 50, "g"),
        new Ingridient("Mais", 80, "g"),
        new Ingridient("Tacosaus", 75, "g"),
        new Ingridient("Paprika", 1/4),
        new Ingridient("Tomat",	1/2),
        new Ingridient("Løk", 1/5),
        new Ingridient("Lefser", 3),
        new Ingridient("Tacokrydder", 1/2 ),
        new Ingridient("Salat",	1/10),
        new Ingridient("Agurk",	1/5),
        new Ingridient("Rømme",	1/5)
];


function generate_taco(e: Event) {
    if ((e.target as HTMLElement).id === "people") {
        (<HTMLInputElement>document.getElementById("people_range")).value = (e.target as HTMLInputElement).value;
    } else if ((e.target as HTMLElement).id === "people_range") {
        (<HTMLInputElement>document.getElementById("people")).value = (e.target as HTMLInputElement).value;
    }
    const people = Number((<HTMLInputElement>document.getElementById("people")).value)
    const tableData = ingridient_list.map(ingridient => {
        return (
        `<tr>
           <td>${ingridient.name}</td>
           <td>${Math.ceil(people*ingridient.value)} ${ingridient.unit}</td>
           <td>${(people*ingridient.value).toFixed(2)} ${ingridient.unit}</td>
           <td>${ingridient.value} ${ingridient.unit}</td>
        </tr>`
      );
    }).join('');
    document.getElementById("tableBody").innerHTML = tableData;
}

var numpeople = document.getElementById("people");
numpeople.addEventListener("input", generate_taco);
document.getElementById("people_range").addEventListener("input", generate_taco);
// create an initial event to populate the table
var init_event = new Event("input", {
    bubbles: true,
});
numpeople.dispatchEvent(init_event);
