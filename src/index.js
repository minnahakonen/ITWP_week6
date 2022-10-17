import "./styles.css";
import { Chart } from "frappe-charts/dist/frappe-charts.min.esm";

const submitButton = document.getElementById("submit-data");
const inputField = document.getElementById("input-area");
const addDataButton = document.getElementById("add-data");
//const navigateLink = document.getElementById("navigation");
const codeMap = new Map();
let chart;
let vaestomaara;
let update = false;
//let count = 1;

const jsonQuery = {
  query: [
    {
      code: "Vuosi",
      selection: {
        filter: "item",
        values: [
          "2000",
          "2001",
          "2002",
          "2003",
          "2004",
          "2005",
          "2006",
          "2007",
          "2008",
          "2009",
          "2010",
          "2011",
          "2012",
          "2013",
          "2014",
          "2015",
          "2016",
          "2017",
          "2018",
          "2019",
          "2020",
          "2021"
        ]
      }
    },
    {
      code: "Alue",
      selection: {
        filter: "item",
        values: ["SSS"]
      }
    },
    {
      code: "Tiedot",
      selection: {
        filter: "item",
        values: [
          "vaesto"
          //"vm01",
          //"vm11"
        ]
      }
    }
  ],
  response: {
    format: "json-stat2"
  }
};
let newJsonQuery = jsonQuery;

//jsonQuery.query[1].selection.values.push("KU049");
//console.log(jsonQuery.query[1].selection.values);

const getData = async () => {
  const url =
    "https://statfin.stat.fi/PxWeb/api/v1/en/StatFin/synt/statfin_synt_pxt_12dy.px";

  const res = await fetch(url, {
    method: "POST",
    headers: {"content-type": "application/json"},
    body: JSON.stringify(jsonQuery)
  });
  if (!res.ok) {
    return;
  }
  const data = await res.json();

  return data;
};

async function getMunicipalities() {
  const url2 =
    "https://statfin.stat.fi/PxWeb/api/v1/en/StatFin/synt/statfin_synt_pxt_12dy.px";
  const municPromise = await fetch(url2);
  const municJSON = await municPromise.json();

  const values = Object.values(municJSON.variables[1]);
  //console.log(values);
  const codes = Object.values(values[2]);
  const names = Object.values(values[3]);
  //console.log(codes);
  //console.log(names);
  const codesandnames = [names, codes];

  for (let i = 0; i < codesandnames[0].length; i++) {
    codeMap.set(codesandnames[0][i].toUpperCase(), codesandnames[1][i]);
  }
}

function getUserValues() {
  let codeToQuery;
  let municipalityName = inputField.value;
  //console.log(municipalityName);
  codeToQuery = codeMap.get(municipalityName.toUpperCase());

  if (!codeToQuery) {
    return;
  }
  newJsonQuery.query[1].selection.values.shift();
  newJsonQuery.query[1].selection.values.push(codeToQuery);
  return newJsonQuery;
}

const getUpdatedData = async () => {
  const url =
    "https://statfin.stat.fi/PxWeb/api/v1/en/StatFin/synt/statfin_synt_pxt_12dy.px";

  const res = await fetch(url, {
    method: "POST",
    headers: {"content-type": "application/json"},
    body: JSON.stringify(newJsonQuery)
  });
  if (!res.ok) {
    return;
  }
  const updatedData = await res.json();

  return updatedData;
};
submitButton.addEventListener("click", function () {
  getUserValues();
  buildUpdatedChart();
  //count++;
  //console.log(count);
  //return count;
});

const buildChart = async () => {
  const data = await getData();
  //console.log(data);

  const alue = Object.values(data.dimension.Alue.category.label);
  const vuosi = Object.values(data.dimension.Vuosi.category.label);
  vaestomaara = data.value;
  const vuodet = [];

  vuosi.forEach((element) => {
    vuodet.push(element);

    //console.log(tiedot);
  });
  /*alue.forEach((municipality, index) => {
      let municTiedot = [];
      for (let i = 0; i < 22; i++) {
        municTiedot.push(tiedot[i * 2 + index]);
      }
      alue[index] = {
        name: municipality,
        values: municTiedot
      };
    });*/

  const chartData = {
    labels: vuodet,
    datasets: [
      {
        name: "population",
        type: "line",
        values: vaestomaara
      }
    ]
  };

  chart = new Chart("#chart", {
    title: "Population",
    data: chartData,
    type: "line",
    height: 450,
    colors: ["#eb5146"]
  });
};

const buildUpdatedChart = async () => {
  update = true;
  const data2 = await getUpdatedData();
  //console.log(data2);

  const alue = Object.values(data2.dimension.Alue.category.label);
  const vuosi = Object.values(data2.dimension.Vuosi.category.label);
  vaestomaara = data2.value;
  const vuodet = [];
  vuosi.forEach((element) => {
    vuodet.push(element);

    //console.log(alue);
  });
  /*alue.forEach((municipality, index) => {
    let municTiedot = [];
    for (let i = 0; i < 22; i++) {
      municTiedot.push(tiedot[i * count + index]);
    }
    alue[index] = {
      name: municipality,
      values: municTiedot
    };
  });
  console.log(alue);*/

  //console.log(vuosi);
  //console.log(tiedot);

  const chartData2 = {
    labels: vuodet,
    //datasets: alue
    datasets: [
      {
        name: inputField.value,
        type: "line",
        values: vaestomaara
      }
    ]
  };
  //console.log(chartData2);
  //chart.update(chartData2);
  chart = new Chart("#chart", {
    title: "Population",
    data: chartData2,
    type: "line",
    height: 450,
    colors: ["#eb5146"]
  });
};
function calculatePrediction() {
  let vahennettavat = [];
  for (let i = vaestomaara.length - 1; i >= 0; i--) {
    vahennettavat.push(vaestomaara[i]);
  }
  //console.log(vahennettavat);
  let vahennetyt = [];
  vahennetyt = vahennettavat.slice(1).map((v, i) => v - vahennettavat[i]);
  //console.log(vahennetyt);
  // reference: https://stackoverflow.com/questions/53260142/javascript-go-through-array-and-subtract-each-item-with-next
  const sum = vahennetyt.reduce((accumulator, value) => {
    return accumulator + value;
  }, 0);
  let meanDelta = sum / 21;
  //console.log(meanDelta);
  let lastPoint = vahennettavat.slice(0, 1);
  let result = Math.round(lastPoint - meanDelta);
  //console.log(result);

  let label = "2022";
  let valueFromEachDataset = [result];

  chart.addDataPoint(label, valueFromEachDataset);
}
addDataButton.addEventListener("click", function () {
  calculatePrediction();
});

getMunicipalities();
if (update === false) {
  buildChart();
}
