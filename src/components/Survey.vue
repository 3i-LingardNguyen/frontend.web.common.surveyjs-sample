<script setup lang="ts">
import { Model, type ITheme } from "survey-core";
import { json } from "../../data/survey_json.js";
import { theme } from "../../data/survey_theme.js";

const jsonData =
  window.localStorage.getItem("survey-json") || JSON.stringify(json);

const survey = new Model(JSON.parse(jsonData));
survey.applyTheme(theme as ITheme);

survey.onComplete.add((sender) => {
  window.localStorage.setItem(
    "survey-data",
    JSON.stringify([
      ...JSON.parse(window.localStorage.getItem("survey-data") || "[]"),
      sender.data,
    ])
  );
});
</script>

<template>
  <SurveyComponent :model="survey"></SurveyComponent>
</template>