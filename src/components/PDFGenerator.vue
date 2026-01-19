<template>
  <div class="container">
    <h1>SurveyJS PDF Generator</h1>
    <div class="jumbotron">
      <button class="btn btn-primary" v-on:click="savePDF">Save as PDF</button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { Model } from "survey-core";
import { SurveyPDF } from "survey-pdf";

const json = window.localStorage.getItem("survey-json") || "{}";

const model = new Model(JSON.parse(json));
const savePDF = function () {
  const surveyPDF = new SurveyPDF(JSON.parse(json));
  surveyPDF.data = model.data;
  surveyPDF.save();
};
</script>
