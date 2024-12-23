import React, { useState, useEffect, useRef } from "react";
import SideNavbar from "../Components/SideNavbar";
import MainContent from "../Components/MainContent";
import Dropdown from "../Components/Dropdown";
import Table from "../Components/Table";
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';

function Model() {
    const [s_ModelNum, s_setModelNum] = useState();
    const [s_ModelVersion, s_setModelVersion] = useState();
    const [allVersions, setAllVersions] = useState([]); // All available versions
    const [filteredVersions, setFilteredVersions] = useState([]); // Versions for the selected model
    const [s_Data, s_setData] = useState([]);
    const [modelsList, setModelsList] = useState([]);
    const [s_accuracy, s_setAccuracy] = useState(0);

    // Fetch models and versions on mount
    useEffect(() => {
        async function GetModels() {
            try {
                const response = await fetch(`/ML/getmodels`);
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
    //v_INTforestID v_INTforestVersion
    async function GetData() {
        s_setData("Loading");
        try {
            const response = await fetch(`/ML/validate?v_INTforestID=${s_ModelNum}&v_INTforestVersion=${s_ModelVersion}`)
            if (!response.ok) {
                throw new Error('Failed to fetch validation Data');                
            }
            const validationData = await response.json();
            s_setData(validationData.results);
            s_setAccuracy(validationData.accuracy);
        }
        catch (error) {
            console.error(error);
        }
    }

    return (
        <div className="d-flex flex-grow-1">
            <SideNavbar Links={[
                { link: "/Model", label: "Model Explanation" },
                { link: "/Model/Training", label: "Validating the Model" },
                { link: "/Model/Visualization", label: "Visualizing the Model" },
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
                    >Validate</button>
                </div>
                <Table data={s_Data} title={`Model: ${s_ModelNum} Version: ${s_ModelVersion}`} />
                {s_accuracy == 0 ? null : <h5>Accuracy: {s_accuracy}</h5>}
                <p>
                    The above table shows our models work against it&apos;s validation data.
                    Since we are using time-series data for our model, we used walk-foward validation.
                    In this methodology we train the model on the first half of our available data, then test it against the next available time step.
                    Then we recompile the model including this newest entry and test it on the next time step, wash, rinse, repeat until we have worked through all of our data.
                    Below you can see the actual code used to validate the model. Full code for every piece of the project is available on my <a href="https://github.com/JBGitIt/WGUCapstoneUI">GitHub</a>.
                </p>
                <h3>Prediction Method</h3>
                <p>The is also a prediction method on the arborist class but it is just averaging the results from this prediction method. If you&apos;d like to review that and the DecisionTree Predict() method they are available on my <a href="https://github.com/JBGitIt/WGUCapstone/tree/master/RandomForest">GitHub</a>.</p>
                <SyntaxHighlighter language="csharp" style={atomOneDark} showLineNumbers={true}>
                    {`
        /// <summary>
        /// This is the method used to make predictions.
        /// It is recursive(ish) and will travers it's way down the tree until it hits a leafnode at which point that value will be passed back up the tree.
        /// </summary>
        /// <param name="r_COLLfeatures"></param>
        /// <returns></returns>
        internal object Predict(IEnumerable<object> r_COLLfeatures)
        {
            //if this node has a value then it must be a leaf and we simply return that value to the caller.
            if (c_OBJvalue is not null)
            {
                return c_OBJvalue;
            }
            //otherwise we continue traversing our way down the tree.
            else
            {
                //we check if this is a numeric node
                if (c_BOOLisNumeric)
                {
                    //then compare the value of the feature from r_COLLfeatures that corresponds to the the threshold of this node with said threshold.
                    if (Convert.ToDouble(r_COLLfeatures.ElementAt(c_INTfeatureIndex)) <= Convert.ToDouble(c_OBJthreshold))
                    {
                        //if the value is less than the threshold we continue down the left branch
                        return LeftSubtree.RootNode.Predict(r_COLLfeatures);
                    }
                    else
                    {
                        //if the value is greater than the threshold we continue down the right branch
                        return RightSubtree.RootNode.Predict(r_COLLfeatures);
                    }
                }
                else
                {
                    //if this is not a numeric node then the left branch is taken if the value is equal to our threshold value
                    if (r_COLLfeatures.ElementAt(c_INTfeatureIndex) == c_OBJthreshold)
                    {
                        return LeftSubtree.RootNode.Predict(r_COLLfeatures);
                    }
                    //all other values go down the right branch.
                    else
                    {
                        return RightSubtree.RootNode.Predict(r_COLLfeatures);
                    }
                }
            }
        }` }
                </SyntaxHighlighter>
                <h3>API method for working through the validation</h3>
                <SyntaxHighlighter language="csharp" style={atomOneDark}>
                    {`` }
                </SyntaxHighlighter>
            </MainContent>
        </div>
    );
}

export default Model;
