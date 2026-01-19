<template>
  <div>
    <h1>SurveyJS Dashboard - Table View</h1>
    <div id="tableContainer"></div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted } from "vue";
import { Model } from "survey-core";
import jsPDF from "jspdf";
import { applyPlugin } from "jspdf-autotable";
applyPlugin(jsPDF);
import * as XLSX from "xlsx";

import { Tabulator } from "survey-analytics/survey.analytics.tabulator";
import "survey-analytics/survey.analytics.tabulator.min.css";
import "tabulator-tables/dist/css/tabulator.min.css";

const json = window.localStorage.getItem("survey-json") || "{}";
const data = JSON.parse(window.localStorage.getItem("survey-data") || "[]");

const survey = new Model(JSON.parse(json));

onMounted(() => {
  const dashboardTabulator = new Tabulator(survey, data, {
    jspdf: jsPDF,
    xlsx: XLSX,
  });
  dashboardTabulator.render(
    document.getElementById("tableContainer") as HTMLElement
  );
});
</script>