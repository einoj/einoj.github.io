var Ingridient = /** @class */ (function () {
    function Ingridient(name, value, unit) {
        this.name = name;
        this.value = value;
        if (unit !== undefined) {
            this.unit = unit;
        }
        else {
            this.unit = "";
        }
    }
    return Ingridient;
}());
var ingridient_list = [
    new Ingridient("Kjøttdeig", 200, "g"),
    new Ingridient("Ost", 50, "g"),
    new Ingridient("Mais", 80, "g"),
    new Ingridient("Tacosaus", 75, "g"),
    new Ingridient("Paprika", 1 / 4),
    new Ingridient("Tomat", 1 / 2),
    new Ingridient("Løk", 1 / 5),
    new Ingridient("Lefser", 3),
    new Ingridient("Tacokrydder", 1 / 2),
    new Ingridient("Salat", 1 / 10),
    new Ingridient("Agurk", 1 / 5),
    new Ingridient("Rømme", 1 / 5)
];
function generate_taco(e) {
    if (e.target.id === "people") {
        document.getElementById("people_range").value = e.target.value;
    }
    else if (e.target.id === "people_range") {
        document.getElementById("people").value = e.target.value;
    }
    var people = Number(document.getElementById("people").value);
    var tableData = ingridient_list.map(function (ingridient) {
        return ("<tr>\n           <td>".concat(ingridient.name, "</td>\n           <td>").concat(Math.ceil(people * ingridient.value), " ").concat(ingridient.unit, "</td>\n           <td>").concat((people * ingridient.value).toFixed(2), " ").concat(ingridient.unit, "</td>\n           <td>").concat(ingridient.value, " ").concat(ingridient.unit, "</td>\n        </tr>"));
    }).join('');
    document.getElementById("tableBody").innerHTML = tableData;
}
var numpeople = document.getElementById("people");
numpeople.addEventListener("input", generate_taco);
document.getElementById("people_range").addEventListener("input", generate_taco);
// create an initial event to populate the table
var init_event = new Event("input", {
    bubbles: true
});
numpeople.dispatchEvent(init_event);
