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
    //v_INTforestID v_INTforestVersion
    async function GetData() {
        s_setData("Loading");
        try {
            const response = await fetch(`${APIprefix}ML/validate?v_INTforestID=${s_ModelNum}&v_INTforestVersion=${s_ModelVersion}`)
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
                    {` [HttpGet("validate")]
        public IActionResult ValidateModel(int v_INTforestID, int v_INTforestVersion)
        {
            //These collections 
            IEnumerable<object> l_COLLtestData = new List<object>();
            IEnumerable<object> l_COLLtestClassifications = new List<object>();
            IEnumerable<object> l_COLLtestClassAmounts = new List<object>();
            IEnumerable<object> l_COLLtestDataAmounts = new List<object>();
            IEnumerable<DateTime> l_COLLtestDates = new List<DateTime>();

            IEnumerable<object> l_COLLtrainData = new List<object>();
            IEnumerable<object> l_COLLtrainClassifications = new List<object>();
            IEnumerable<object> l_COLLtrainClassAmounts = new List<object>();
            IEnumerable<object> l_COLLtrainDataAmounts = new List<object>();
            IEnumerable<DateTime> l_COLLtrainDates = new List<DateTime>();

            //ArboristFromDB(v_INTforestID, v_INTforestVersion);

            //throw new NotImplementedException();

            using (SqlConnection l_OBJsqlConn = new SqlConnection("Server=localhost; Database=WGUCapstone; Integrated Security=True; Trust Server Certificate=True"))
            {
                l_OBJsqlConn.Open();

                SqlCommand l_OBJsqlCmd = l_OBJsqlConn.CreateCommand();

                l_OBJsqlCmd.CommandText = "CapstoneUI.selGetValidationData";
                l_OBJsqlCmd.CommandType = CommandType.StoredProcedure;

                l_OBJsqlCmd.Parameters.Add(new SqlParameter("@ForestID", v_INTforestID));
                l_OBJsqlCmd.Parameters.Add(new SqlParameter("@VersionID", v_INTforestVersion));

                BuildTrainingSets(l_OBJsqlCmd, ref l_COLLtestData, ref l_COLLtestClassifications, ref l_COLLtestDates, ref l_COLLtestDataAmounts, ref l_COLLtestClassAmounts);
            }

            using (SqlConnection l_OBJsqlConn = new SqlConnection("Server=localhost; Database=WGUCapstone; Integrated Security=True; Trust Server Certificate=True"))
            {
                l_OBJsqlConn.Open();
                SqlCommand l_OBJsqlCommand = l_OBJsqlConn.CreateCommand();
                l_OBJsqlCommand.CommandType = CommandType.StoredProcedure;
                l_OBJsqlCommand.CommandText = "CapstoneUI.selGetTrainingData";
                l_OBJsqlCommand.Parameters.Add(new SqlParameter("@ForestID", v_INTforestID));
                l_OBJsqlCommand.Parameters.Add(new SqlParameter("@VersionID", v_INTforestVersion));

                BuildTrainingSets(l_OBJsqlCommand, ref l_COLLtrainData, ref l_COLLtrainClassifications, ref l_COLLtrainDates, ref l_COLLtrainDataAmounts, ref l_COLLtrainClassAmounts);
            }

            DataTable l_OBJpredictionTable = new DataTable();
            l_OBJpredictionTable.Columns.Add("RandomForestID", Type.GetType("System.Int32"));
            l_OBJpredictionTable.Columns.Add("Version", Type.GetType("System.Int32"));
            l_OBJpredictionTable.Columns.Add("AsOfDate", Type.GetType("System.DateTime"));
            l_OBJpredictionTable.Columns.Add("PredictedGDP", Type.GetType("System.Double"));
            l_OBJpredictionTable.Columns.Add("RangeHigh", Type.GetType("System.Double"));
            l_OBJpredictionTable.Columns.Add("RangeLow", Type.GetType("System.Double"));
            l_OBJpredictionTable.Columns.Add("Actual", Type.GetType("System.Double"));
            l_OBJpredictionTable.Columns.Add("isCorrect", Type.GetType("System.Boolean"));

            DataTable l_OBJtable = new DataTable();
            l_OBJtable.Columns.Add("T2_Date", Type.GetType("System.DateTime"));

            Arborist l_OBJarboristRemade = ArboristFromDB(v_INTforestID, v_INTforestVersion);

            while (l_COLLtestData.Count() > 0)
            {
                IEnumerable<object> l_COLLpredictionTest = (IEnumerable<object>)l_COLLtestData.First();

                object[] l_COLLresults = l_OBJarboristRemade.Predict(l_COLLpredictionTest);

                double l_DBLprediction = ((double)l_COLLresults[0] / 100) * Convert.ToDouble((decimal)(l_COLLtrainClassAmounts.Last())) + Convert.ToDouble((decimal)(l_COLLtrainClassAmounts.Last()));
                double l_DBLhigh = ((double)l_COLLresults[1] / 100) * Convert.ToDouble((decimal)(l_COLLtrainClassAmounts.Last())) + Convert.ToDouble((decimal)(l_COLLtrainClassAmounts.Last()));
                double l_DBLlow = ((double)l_COLLresults[2] / 100) * Convert.ToDouble((decimal)(l_COLLtrainClassAmounts.Last())) + Convert.ToDouble((decimal)(l_COLLtrainClassAmounts.Last()));

                Dictionary<string, double> l_COLLoutputProcessed = OutputProcessor.GetPredictiveRange(l_DBLhigh, l_DBLlow, l_DBLprediction, (int)l_COLLresults[3], (int)l_COLLresults[4]);

                DataRow l_OBJpredictionRow = l_OBJpredictionTable.NewRow();
                l_OBJpredictionRow[0] = v_INTforestID;
                l_OBJpredictionRow[1] = v_INTforestVersion;
                l_OBJpredictionRow[2] = l_COLLtestDates.First();
                l_OBJpredictionRow[3] = l_DBLprediction;
                l_OBJpredictionRow[4] = l_DBLhigh;
                l_OBJpredictionRow[5] = l_DBLlow;
                l_OBJpredictionRow[6] = l_COLLtestClassAmounts.First();
                l_OBJpredictionRow[7] = (l_DBLhigh > Convert.ToDouble((decimal)l_COLLtestClassAmounts.First()) && l_DBLlow < Convert.ToDouble((decimal)l_COLLtestClassAmounts.First()));
                l_OBJpredictionTable.Rows.Add(l_OBJpredictionRow);

                DataRow l_OBJnewRow = l_OBJtable.NewRow();
                l_OBJnewRow.SetField<DateTime>("T2_Date", l_COLLtestDates.First());
                l_OBJtable.Rows.Add(l_OBJnewRow);

                l_COLLtrainData = l_COLLtrainData.Append(l_COLLtestData.First());

                l_COLLtrainClassifications = l_COLLtrainClassifications.Append(l_COLLtestClassifications.First());

                l_COLLtrainClassAmounts = l_COLLtrainClassAmounts.Append(l_COLLtestClassAmounts.First());

                l_COLLtrainDates = l_COLLtrainDates.Append(l_COLLtestDates.First());

                l_COLLtestData = l_COLLtestData.Skip(1).ToList();

                l_COLLtestClassifications = l_COLLtestClassifications.Skip(1).ToList();

                l_COLLtestClassAmounts = l_COLLtestClassAmounts.Skip(1).ToList();

                l_COLLtestDates = l_COLLtestDates.Skip(1).ToList();

                l_OBJarboristRemade = new Arborist(l_COLLtrainData, l_COLLtrainClassifications, 1000, 100, 2);
                l_OBJarboristRemade.PlantForestTimeSeries(12, 12);
            }
            decimal l_DECaccuracy = 0m;
            if (l_OBJpredictionTable.Rows.Count > 0)
            {
                using (SqlConnection l_OBJsqlConn = new SqlConnection("Server=localhost; Database=WGUCapstone; Integrated Security=True; Trust Server Certificate=True"))
                {
                    l_OBJsqlConn.Open();

                    SqlCommand l_OBJsqlCmd = new SqlCommand("CapstoneUI.updSetTrainingData");

                    l_OBJsqlCmd.Connection = l_OBJsqlConn;
                    l_OBJsqlCmd.CommandType = CommandType.StoredProcedure;

                    l_OBJsqlCmd.Parameters.Add(new SqlParameter("@TrainingDates", l_OBJtable));
                    l_OBJsqlCmd.Parameters.Add(new SqlParameter("@OriginalTraining", false));
                    l_OBJsqlCmd.Parameters.Add(new SqlParameter("@ForestID", v_INTforestID));

                    using (SqlDataReader l_OBJsqlRdr = l_OBJsqlCmd.ExecuteReader())
                    {
                        while (l_OBJsqlRdr.Read())
                        {
                            v_INTforestVersion = l_OBJsqlRdr.GetInt32(1);
                        }
                    }
                }

                using (SqlConnection l_OBJsqlConnection = new SqlConnection("Server=localhost;Database=WGUCapstone;Integrated Security=SSPI;TrustServerCertificate=True"))
                {
                    l_OBJsqlConnection.Open();

                    SqlCommand l_OBJsqlCommand = l_OBJsqlConnection.CreateCommand();
                    l_OBJsqlCommand.CommandType = CommandType.StoredProcedure;
                    l_OBJsqlCommand.Parameters.Add(new SqlParameter("@PredictionResults", l_OBJpredictionTable));

                    l_OBJsqlCommand.CommandText = "CapstoneUI.InsPredictionResults";

                    l_OBJsqlCommand.ExecuteNonQuery();

                    l_OBJsqlConnection.Close();
                }

                foreach (DecisionTree l_OBJtree in l_OBJarboristRemade.Forest)
                {
                    ExpandAndSubmitTree(l_OBJtree, v_INTforestID, v_INTforestVersion);
                }

                int l_INTcorrect = l_OBJpredictionTable.AsEnumerable().Count(row => { return row.Field<bool>("isCorrect"); });
                l_DECaccuracy =  l_INTcorrect / Convert.ToDecimal(l_OBJpredictionTable.Rows.Count) * 100;
            }
            else
            {
                using (SqlConnection l_OBJsqlConnection = new SqlConnection("Server=localhost;Database=WGUCapstone;Integrated Security=SSPI;TrustServerCertificate=True"))
                {
                    l_OBJsqlConnection.Open();
                    SqlCommand l_OBJsqlComm = l_OBJsqlConnection.CreateCommand();
                    l_OBJsqlComm.CommandText = "CapstoneUI.selGetValidationResults";
                    l_OBJsqlComm.CommandType = CommandType.StoredProcedure;
                    l_OBJsqlComm.Parameters.Add(new SqlParameter("@ForestID", v_INTforestID));
                    l_OBJsqlComm.Parameters.Add(new SqlParameter("@Version", v_INTforestVersion));

                    using (SqlDataReader l_OBJsqlRdr = l_OBJsqlComm.ExecuteReader())
                    {
                        while (l_OBJsqlRdr.Read())
                        {
                            DataRow l_OBJnewRow = l_OBJpredictionTable.NewRow();
                            l_OBJnewRow.SetField("AsOfDate", l_OBJsqlRdr.GetDateTime(0));
                            l_OBJnewRow.SetField("PredictedGDP", l_OBJsqlRdr.GetDecimal(1));
                            l_OBJnewRow.SetField("RangeHigh", l_OBJsqlRdr.GetDecimal(2));
                            l_OBJnewRow.SetField("RangeLow", l_OBJsqlRdr.GetDecimal(3));
                            l_OBJnewRow.SetField("Actual", l_OBJsqlRdr.GetDecimal(4));
                            l_OBJnewRow.SetField("isCorrect", l_OBJsqlRdr.GetBoolean(5));
                            l_OBJpredictionTable.Rows.Add(l_OBJnewRow);
                        }

                        l_OBJsqlRdr.NextResult();

                        while (l_OBJsqlRdr.Read())
                        {
                            l_DECaccuracy = l_OBJsqlRdr.GetDecimal(0);
                        }
                    }
                }
            }

            return Ok(new { results = l_OBJpredictionTable.AsEnumerable().Select((row) => new
            {
                Date = row["AsOfDate"]
                    ,
                PredictedGDP = row["PredictedGDP"]
                    ,
                High = row["RangeHigh"]
                    ,
                Low = row["RangeLow"]
                    ,
                Actual = row["Actual"]
                    ,
                Correct = row["isCorrect"]
            }).ToList(), accuracy = l_DECaccuracy});
        }` }
                </SyntaxHighlighter>
            </MainContent>
        </div>
    );
}

export default Model;
