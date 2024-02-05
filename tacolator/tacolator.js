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
function generate_taco() {
    var people = Number(document.getElementById("people").value);
    var tableData = ingridient_list.map(function (ingridient) {
        return ("<tr>\n           <td>" + ingridient.name + "</td>\n           <td>" + Math.ceil(people * ingridient.value) + " " + ingridient.unit + "</td>\n           <td>" + (people * ingridient.value).toFixed(2) + " " + ingridient.unit + "</td>\n           <td>" + ingridient.value + " " + ingridient.unit + "</td>\n        </tr>");
    }).join('');
    document.getElementById("tableBody").innerHTML = tableData;
}
generate_taco();
