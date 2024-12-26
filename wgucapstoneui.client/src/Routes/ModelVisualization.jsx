import React, { useState, useEffect, useRef } from "react";
import PropTypes from 'prop-types';
import SideNavbar from "../Components/SideNavbar";
import MainContent from "../Components/MainContent";
import Dropdown from "../Components/Dropdown";
import StandardDeviationGraph from "../Components/StandardDeviationGraph";



function Model() {
    const [s_ModelNum, s_setModelNum] = useState(null);
    const [s_ModelVersion, s_setModelVersion] = useState(null);
    const [allVersions, setAllVersions] = useState([]); // All available versions
    const [filteredVersions, setFilteredVersions] = useState([]); // Versions for the selected model
    const [s_Data, s_setData] = useState([]);
    const [modelsList, setModelsList] = useState([]);
    const [s_formData, s_setFormData] = useState({ BUSLOANS: "", CPIAUCSL: "", DPRIME: "", DPSACBW027SBOG: "", EXPGS: "", IMPGS: "", RHEACBW027SBOG: "", TLRESCONS: "", UNRATE: "", GDP: "" });
    const [s_prediction, s_setPrediction] = useState();

    const isProduction = process.env.NODE_ENV === 'production';
    const APIprefix = isProduction ? '/CapstoneUIAPI/' : '/';

    // Fetch models and versions on mount
    useEffect(() => {
        async function GetModels() {
            try {
                const response = await fetch(`${APIprefix}ML/getmodels`);
                if (!response.ok) throw new Error('Failed to fetch models');
                const models = await response.json();
                const modelItems = [];
                const versionItems = [];
                Object.keys(models).forEach((model) => {
                    modelItems.push({ label: `Model: ${model}`, value: model });
                    models[model].forEach((version) => {
                        versionItems.push({
                            ForestID: model,
                            VersionID: version.p_INTversion,
                            VersionDate: version.p_OBJversionDate,
                        });
                    });
                });
                setModelsList(modelItems);
                setAllVersions(versionItems); // Store all versions
            } catch (error) {
                console.error(error);
            }
        }
        GetModels();
    }, []);

    // Update filtered versions when the model changes
    useEffect(() => {
        if (s_ModelNum) {
            const updatedVersions = allVersions
                .filter((version) => version.ForestID === s_ModelNum)
                .map((item) => ({ label: `Version ${item.VersionID}`, value: item.VersionID }));
            setFilteredVersions(updatedVersions);
        } else {
            setFilteredVersions([]); // Clear versions if no model is selected
        }
        s_setModelVersion(null); // Reset the selected version
    }, [s_ModelNum, allVersions]);

    async function GetData() {
        try {
            const response = await fetch(`${APIprefix}ML/validateChart?v_INTforestID=${s_ModelNum}&v_INTforestVersion=${s_ModelVersion}`);
            if (!response.ok) {
                throw new Error('Failed to fetch validation Data');
            }
            const validationData = await response.json();
            s_setData(validationData);
        }
        catch (error) {
            console.error(error);
        }        
    }

    async function GetNewData() {
        try {
            const response = await fetch(`${APIprefix}ML/mostRecentData`);
            if (!response.ok) {
                throw new Error('Failed to check for new Data');
            }
            const newData = await response.json();
            var newFormData = { BUSLOANS: "", CPIAUCSL: "", DPRIME: "", DPSACBW027SBOG: "", EXPGS: "", IMPGS: "", RHEACBW027SBOG: "", TLRESCONS: "", UNRATE: "", GDP: "" }
            newData.forEach(data => {
                if (data.date != data.olddate) {                
                    newFormData[data.series] = data.value
                }
            })
            s_setFormData(newFormData);
        }
        catch (error) {
            console.error(error);
        }
    }

    async function GetPrediction() {
        try {
            const response = await fetch(`${APIprefix}ML/prediction?v_INTforestID=${s_ModelNum}&v_INTforestVersion=${s_ModelVersion}&v_DECbusLoans=${s_formData.BUSLOANS}&v_DECcPIAUCSL=${s_formData.CPIAUCSL}&v_DECdPrime=${s_formData.DPRIME}&v_DECdPSACBW027SBOG=${s_formData.DPSACBW027SBOG}&v_DECeXPGS=${s_formData.EXPGS}&v_DECiMPGS=${s_formData.IMPGS}&v_DECrHEACBW027SBOG=${s_formData.RHEACBW027SBOG}&v_DECtLRESCONS=${s_formData.TLRESCONS}&v_DECuNRATE=${s_formData.UNRATE}&v_DECgDP=${s_formData.GDP}`)
            if (!response.ok) {
                throw new Error('Failed to get prediction');
            }
            const prediction = await response.json();
            s_setPrediction(prediction);
        }
        catch (error) {
            console.error(error);
        }
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        //Have to run the new data through the models prediction method.
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        s_setFormData((prev) => ({ ...prev, [name]: value }));
    };

    function GetValidForm() {
        return (s_ModelVersion != null && s_formData.BUSLOANS != "" && s_formData.CPIAUCSL != "" && s_formData.DPRIME != "" && s_formData.DPSACBW027SBOG != "" && s_formData.EXPGS != "" && s_formData.IMPGS != "" && s_formData.RHEACBW027SBOG != "" && s_formData.TLRESCONS != "" && s_formData.UNRATE != "" && s_formData.GDP != "");
    }

    return (
        <div className="d-flex flex-grow-1">
            <SideNavbar Links={[
                { link: "/Model", label: "Model Explaination" }
                , { link: "/Model/Validation", label: "Validating the Model" }
                , { link: "/Model/Training", label: "Training the Model" }
            ]} />
            <MainContent>
                <div className="d-flex">
                    <Dropdown
                        updateValue={s_setModelNum}
                        defaultStateValue={{ label: "Select Model #", value: "" }}
                        listItems={modelsList}
                        selectedValue={s_ModelNum}
                    />
                    <Dropdown
                        updateValue={s_setModelVersion}
                        defaultStateValue={{ label: "Select Version #", value: "" }}
                        listItems={filteredVersions}
                        selectedValue={s_ModelVersion}
                    />
                    <button
                        className="btn btn-primary"
                        style={{ margin: "20px" }}
                        type="button"
                        onClick={GetData}
                    >Chart</button>
                </div>
                <StandardDeviationGraph
                    areaKeys = {["high", "low"]}
                    topLineKey = "high"
                    bottomLineKey = "low"
                    midLineKey = "predictedGDP"
                    testLineKey = "actual"
                    XLabelsKey="date"
                    YMin={16000}
                    YMax={31000}
                    data={s_Data} />
                <div>
                    <h3>Explanation</h3>
                    <p>
                       Here we have a graph showing our model&apos;s validation.
                       Below we can either enter values for new data, or reach out to the API to see if there are any new values available.
                       Then we can run the new values against our model and observe the results.
                       This allows us to see how our model has evolved alongside the dataset as well as give us a visual impression of its overall accuracy.
                    </p>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="BUSLOANS">Commercial Loans (Billions USD)</label>
                        <input
                            id="BUSLOANS"
                            name="BUSLOANS"
                            type="number"
                            value={s_formData.BUSLOANS}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="CPIAUCSL">Consumer Price Index (USD)</label>
                        <input
                            id="CPIAUCSL"
                            name="CPIAUCSL"
                            type="number"
                            value={s_formData.CPIAUCSL}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="DPRIME">Prime Rate (Percentage)</label>
                        <input
                            id="DPRIME"
                            name="DPRIME"
                            type="number"
                            value={s_formData.DPRIME}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="DPSACBW027SBOG">Commercial Deposits (Billions USD)</label>
                        <input
                            id="DPSACBW027SBOG"
                            name="DPSACBW027SBOG"
                            type="number"
                            value={s_formData.DPSACBW027SBOG}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="EXPGS">Exports (Billions USD)</label>
                        <input
                            id="EXPGS"
                            name="EXPGS"
                            type="number"
                            value={s_formData.EXPGS}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="IMPGS">Imports (Billions USD)</label>
                        <input
                            id="IMPGS"
                            name="IMPGS"
                            type="number"
                            value={s_formData.IMPGS}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="RHEACBW027SBOG">Revolving Home Equity Loans (Billions USD)</label>
                        <input
                            id="RHEACBW027SBOG"
                            name="RHEACBW027SBOG"
                            type="number"
                            value={s_formData.RHEACBW027SBOG}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="TLRESCONS">Residential Construction Spending(Millions USD)</label>
                        <input
                            id="TLRESCONS"
                            name="TLRESCONS"
                            type="number"
                            value={s_formData.TLRESCONS}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="UNRATE">Unemployment Rate (Percentage)</label>
                        <input
                            id="UNRATE"
                            name="UNRATE"
                            type="number"
                            value={s_formData.UNRATE}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="GDP">Gross Domestic Product(Billions USD)</label>
                        <input
                            id="GDP"
                            name="GDP"
                            type="number"
                            value={s_formData.GDP}
                            onChange={handleChange}
                        />                        
                    </div>
                </form>
                
                <button
                    className="btn btn-primary"
                    style={{ margin: "20px" }}
                    type="button"
                    onClick={GetNewData}
                >Get New Data</button>
                {GetValidForm() ?
                    <button
                        className="btn btn-primary"
                        style={{ margin: "20px" }}
                        type="button"
                        onClick={GetPrediction}
                    >Get Prediction!</button>
                    :
                    <button
                        className="btn btn-primary disabled"
                        style={{ margin: "20px" }}
                        type="button"
                        disabled
                    >Get Prediction!</button>
                }
                <h3>Prediction</h3>
                {s_prediction == null ? <p>Waiting for Data</p> : <p>Predictive High: {s_prediction.high} <br /> Prediction: {s_prediction.prediction} <br /> Predictive Low: {s_prediction.low}</p>}
            </MainContent>
        </div>
    );
}

export default Model;