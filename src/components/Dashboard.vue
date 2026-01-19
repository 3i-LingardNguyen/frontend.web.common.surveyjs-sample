<template>
  <div>
    <h1>SurveyJS Dashboard</h1>
    <div id="summaryContainer"></div>
  </div>
</template>

<script lang="ts" setup>
import { Model } from "survey-core";
import { VisualizationPanel } from "survey-analytics";
import { onMounted } from "vue";

import "survey-analytics/survey.analytics.min.css";

const json = window.localStorage.getItem("survey-json") || "{}";
const data = JSON.parse(window.localStorage.getItem("survey-data") || "[]");

const survey = new Model(JSON.parse(json));

onMounted(() => {
  const dashboard = new VisualizationPanel(survey.getAllQuestions(), data);
  dashboard.render(document.getElementById("summaryContainer") as HTMLElement);
});
</script>