import React, { useEffect, useState } from 'react';
import SideNavbar from "../Components/SideNavbar";
import MainContent from "../Components/MainContent";
import Dropdown from "../Components/Dropdown";
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';

function Model() {
    const [s_modelInfo, s_setModelInfo] = useState();

    const isProduction = process.env.NODE_ENV === 'production';
    const APIprefix = isProduction ? '/CapstoneUIAPI/' : '/';

    async function TrainModel() {
        s_setModelInfo("Training...");
        try {
            const response = await fetch(`${APIprefix}ML/trainmodel`);
            if (!response.ok) {
                throw new Error('Not ok bro. Sad face');
            }
            const modelInfo = await response.json()
            s_setModelInfo(modelInfo);
        } catch (error) {
            console.error('Could not fetch data', error);
        }
    };


    return (
        <div className="d-flex flex-grow-1">
            <SideNavbar Links={[
                { link: "/Model", label: "Model Explaination" }
                , { link: "/Model/Validation", label: "Validating the Model" }
                , { link: "/Model/Visualization", label: "Visualizing the Model" }
            ]} />
            <MainContent>
                <div>
                    <h3>Training the Model</h3>
                    <p>With all our data prepped we can train our model. The below code contains all the methods that create our Decision Trees.
                        This is all part of the Random Forest C# library that is available on my <a href="https://github.com/JBGitIt/WGUCapstone/tree/master/RandomForest">GitHub</a>.
                    </p>
                    <p>This button will train a new model and store it in the database. The Model # and version will appear below the button once trained and you can validate this model on the validation page.</p>
                    <button
                        className="btn btn-primary"
                        style={{ margin: "20px" }}
                        type="button"
                        onClick={TrainModel}
                    >Train Model</button>
                    {s_modelInfo == null ? null : s_modelInfo == "Training..." ? <p>Training...</p> : <p>Model ID: {s_modelInfo.modelID} | Version: {s_modelInfo.version}</p>}
                    <h5>This is the parent method of the whole process, it lives in the Arborist class. If you need to see the rest of the Arborist class it can be found on <a href="https://github.com/JBGitIt/WGUCapstone/blob/master/RandomForest/Arborist.cs">here</a></h5>
                    <SyntaxHighlighter language="csharp" style={atomOneDark} showLineNumbers={true}>
                        {`
        /// <summary>
        /// Plants a forest to analyze time series data. We take a windowed approach to breaking up the data for our trees.
        /// </summary>
        /// <param name="v_INTwindowWidth">Width of the window of timesteps included in each tree of the forest</param>
        /// <param name="v_INTwindowStep">How many timesteps to move the window forward for each tree</param>
        public void PlantForestTimeSeries(int v_INTwindowWidth, int v_INTwindowStep)
        {
            //always start at timestep 0 and included everything within the first window width
            int l_INTwindowStart = 0;
            int l_INTwindowEnd = v_INTwindowWidth;

            //while the end of the current window is less than or equal to the length of our timeseries
            while (l_INTwindowEnd <= c_COLLdataSet.Count())
            {
                List<object> l_COLLslidingWindowData = new List<object>();
                List<object> l_COLLslidingWindowClassifications = new List<object>();

                //grab the elements that correspond to each step in our current window
                for (int i = l_INTwindowStart; i < l_INTwindowEnd; i++)
                {
                    l_COLLslidingWindowData.Add(c_COLLdataSet.ElementAt(i));
                    l_COLLslidingWindowClassifications.Add(c_COLLclassifications.ElementAt(i));
                }

                //Plant a tree using the selected elements
                c_COLLforest.Add(PlantTree(l_COLLslidingWindowData, l_COLLslidingWindowClassifications));

                if (l_INTwindowEnd + v_INTwindowStep > c_COLLdataSet.Count())
                {
                    v_INTwindowStep = l_INTwindowEnd + v_INTwindowStep - c_COLLdataSet.Count();
                }

                l_INTwindowStart += v_INTwindowStep;
                l_INTwindowEnd += v_INTwindowStep;
            }
        }` }
                    </SyntaxHighlighter>
                    <h5>The next method is the actual &quot;planting&quot; of the trees. It is called from the above method on line 27 and lives in the Arborist class. The full code of this class can be found <a href="https://github.com/JBGitIt/WGUCapstone/blob/master/RandomForest/Arborist.cs">here</a></h5>
                    <SyntaxHighlighter language="csharp" style={atomOneDark} showLineNumbers={true}>
                        {`
        /// <summary>
        /// Instantiates and returns a new decision tree based on the values in <paramref name="r_COLLdataSet"/> and <paramref name="r_COLLclassification"/>.
        /// </summary>
        /// <param name="r_COLLdataSet">Dataset to base our DecisionTree on</param>
        /// <param name="r_COLLclassification">The classifications for the dataset we're basing our DecisionTree on.</param>
        /// <returns>DecisionTree build from <paramref name="r_COLLdataSet"/> and <paramref name="r_COLLclassification"/></returns>
        private DecisionTree PlantTree(IEnumerable<object> r_COLLdataSet, IEnumerable<object> r_COLLclassification)
        {
            //DecisionTree to return
            DecisionTree l_OBJnewTree = new DecisionTree(c_INTmaxTreeDepth, 0);

            //Growing the tree
            l_OBJnewTree.GrowTreeRF(r_COLLdataSet, r_COLLclassification);

            //returning the tree
            return l_OBJnewTree;
        }` }
                    </SyntaxHighlighter>
                    <h5>Next we &quot;grow&quot; our tree. This method is called on line __ in the above method and lives in the DecisionTree class. The full code of this class can be found <a href="https://github.com/JBGitIt/WGUCapstone/blob/master/RandomForest/DecisionTree.cs">here</a></h5>
                    <SyntaxHighlighter language="csharp" style={atomOneDark} showLineNumbers={true}>
                        {` 
        /// <summary>
        /// This is a recursive method that will grow the decision tree until it either
        /// reaches it's max depth or each path ends in a leaf.
        /// </summary>
        /// <param name="r_COLLdata">Dataset we are creating our tree from</param>
        /// <param name="r_COLLclassifications">classifications for the rows in our dataset</param>
        internal void GrowTreeRF(IEnumerable<object> r_COLLdata, IEnumerable<object> r_COLLclassifications)
        {
            //We need the total count of records in our set and the unique classifications available for those records
            int l_INTsamples = r_COLLdata.Count();

            HashSet<object> l_COLLuniqueClasses = r_COLLclassifications.ToHashSet();

            //If we don't have what we need in order to split or if our tree has reached it's max depth we produce a leafnode
            if (l_COLLuniqueClasses.Count() == 1 || l_INTsamples < c_INTminSamplesSplit || (c_INTmaxDepth > 0 && c_INTdepth >= c_INTmaxDepth))
            {
                BranchNode l_OBJleaf = GrowLeaf(r_COLLclassifications);

                RootNode = l_OBJleaf;
            }

            //Find the best split for this node
            NodeBud l_OBJbranchBud = GetBestSplit(SubsetFeatures(r_COLLdata), r_COLLclassifications);

            //If the splitting function failed we create a leaf
            if (l_OBJbranchBud is null)
            {
                BranchNode l_OBJleaf = GrowLeaf(r_COLLclassifications);

                RootNode = l_OBJleaf;
            }

            //otherwise we produce out BranchNode
            else
            {
                decimal threshold;

                //if the threshold is a numeric value this is a numeric node
                if (decimal.TryParse(l_OBJbranchBud.Threshold.ToString(), out threshold))
                {
                    RootNode = new BranchNode(true, l_OBJbranchBud.FeatureIndex, l_OBJbranchBud.Threshold);
                }

                //otherwise it's not a numeric node
                else
                {
                    RootNode = new BranchNode(false, l_OBJbranchBud.FeatureIndex, l_OBJbranchBud.Threshold);
                }

                //if we have data for the left branch we produce a subtree based on that data
                if (l_OBJbranchBud.LeftSplit.Count > 0)
                {
                    DecisionTree l_OBJleftTree = new DecisionTree(c_INTmaxDepth, c_INTdepth + 1);
                    RootNode.LeftSubtree = l_OBJleftTree;
                    l_OBJleftTree.GrowTreeRF(l_OBJbranchBud.LeftSplit.Select((row, index) => { return r_COLLdata.ElementAt(index); }), l_OBJbranchBud.LeftSplit.Select(row => { return row.Key; }));
                }
                //if not the left branch ends in a leaf
                else
                {
                    DecisionTree l_OBJleftTree = new DecisionTree(c_INTmaxDepth, c_INTdepth + 1);
                    l_OBJleftTree.RootNode = GrowLeaf(r_COLLclassifications);
                    RootNode.LeftSubtree = l_OBJleftTree;
                }

                //if we have data for the right branch we produce a subtree based on that data
                if (l_OBJbranchBud.RightSplit.Count > 0)
                {
                    DecisionTree l_OBJrightTree = new DecisionTree(c_INTmaxDepth, c_INTdepth + 1);
                    RootNode.RightSubtree = l_OBJrightTree;
                    l_OBJrightTree.GrowTreeRF(l_OBJbranchBud.RightSplit.Select((row, index) => { return r_COLLdata.ElementAt(index); }), l_OBJbranchBud.RightSplit.Select(row => { return row.Key; }));
                }
                //otherwise the right branch ends in a leaf
                else
                {
                    DecisionTree l_OBJrightTree = new DecisionTree(c_INTmaxDepth, c_INTdepth + 1);
                    l_OBJrightTree.RootNode = GrowLeaf(r_COLLclassifications);
                    RootNode.RightSubtree = l_OBJrightTree;
                }
            }
        }` }
                    </SyntaxHighlighter>
                    <h5>These methods function together to determine the best split at each node</h5>
                    <SyntaxHighlighter language="csharp" style={atomOneDark} showLineNumbers={true}>
                        {`
        /// <summary>
        /// This is by far the clunkiest method in the whole library.
        /// It takes the collection of data as arrays and calculates the best split.
        /// This method has two main branches, one that deals with numeric data and one that deals with non-numeric data(all treated as categorical data for our purposes)
        /// </summary>
        /// <param name="l_COLLconvertedArrays">data set we're processing</param>
        /// <param name="l_COLLclassifications">the analyzed value for each row of data</param>
        /// <returns>A NodeBud object representing the best way to split at this node</returns>
        private NodeBud ProcessArrays(IEnumerable<object> l_COLLconvertedArrays, IEnumerable<object> l_COLLclassifications)
        {
            //variables for tracking the best feature and the splits associated with it
            int l_INTbestFeatureIndex = -1;
            object l_OBJbestThreshold = null;
            List<KeyValuePair<object, object>> l_COLLleftPairs = new List<KeyValuePair<object, object>>();
            List<KeyValuePair<object, object>> l_COLLrightPairs = new List<KeyValuePair<object, object>>();

            //Initial impurity is set to Infinity to ensure it is greater than whatever our intial calculation is.
            double l_DBLimpurity = Double.PositiveInfinity;

            //we use the first array in the collection to get our feature count and to test if each feature is a numeric feature or not.
            IEnumerable<object> l_OBJfirstCollection = new List<object>();

            //cast our first array to an array of objects, clunky, not elegant, but the overall product functions. Future iterations will have better handling of types and data.
            if (l_COLLconvertedArrays.First() is IEnumerable enumerable)
            {
                l_OBJfirstCollection = enumerable.Cast<object>();
            }

            //Get the count of available features
            int l_INTnumFeatures = l_OBJfirstCollection.Count();

            //loop through each feature to find the best one on which to split
            foreach (int i in Enumerable.Range(0, l_INTnumFeatures))
            {
                //first we determine if this is a numeric feature
                double num = 0;
                if (double.TryParse(l_OBJfirstCollection.First().ToString(), out num))
                {
                    //Get a hashset of all the unique values for this feature
                    HashSet<double?> l_COLLthresholds = new HashSet<double?>(
                        l_COLLconvertedArrays
                        .Select(row => double.TryParse((row as Array)?.GetValue(i)?.ToString(), out num) ? num : (double?)null)
                        .Where(v => v.HasValue)
                    );

                    //check each value to see which one splits the full data set best
                    foreach (double l_DBLthreshold in l_COLLthresholds)
                    {
                        //This series of LINQ statements will split the dataset into values greater than the current threshold, and values less than the current threshold
                        Dictionary<int, List<KeyValuePair<object, object>>> l_COLLsplits = l_COLLconvertedArrays
                            .Select((row, index) =>
                            {
                                double? value = null;
                                object key = null;
                                if (row is Array arr && double.TryParse(arr.GetValue(i)?.ToString(), out double parsedValue))
                                {
                                    value = parsedValue;
                                    key = l_COLLclassifications.ElementAt(index);
                                }
                                return value.HasValue
                                    ? (value <= l_DBLthreshold ? (0, new KeyValuePair<object, object>(key, row)) : (1, new KeyValuePair<object, object>(key, row)))
                                    : (-1, new KeyValuePair<object, object>(null, null));
                            })
                            .Where(pair => pair.Item1 >= 0)
                            .GroupBy(pair => pair.Item1)
                            .ToDictionary(g => g.Key, g => g.Select(v => v.Item2).ToList());

                        //These two if blocks are necessary incase we have a split in which all the values go on one branch
                        if (!l_COLLsplits.ContainsKey(0))
                        {
                            l_COLLsplits[0] = new List<KeyValuePair<object, object>>();
                        }
                        if (!l_COLLsplits.ContainsKey(1))
                        {
                            l_COLLsplits[1] = new List<KeyValuePair<object, object>>();
                        }

                        //Perform the impurity calculations, we have used weighted Gini Impurity for our model.
                        double l_DBLleftImpurity = l_COLLsplits[0].Any() ? CalcGiniImpurity(l_COLLsplits[0].Select(row => { return row.Key; })) : 0;

                        double l_DBLrightImpurity = l_COLLsplits[1].Any() ? CalcGiniImpurity(l_COLLsplits[1].Select(row => { return row.Key; })) : 0;

                        double l_DBLweightedImpurity = (l_COLLsplits[0].Count() * l_DBLleftImpurity + l_COLLsplits[1].Count() * l_DBLrightImpurity) / l_COLLconvertedArrays.Count();

                        //see if this split is better than the current best
                        if (l_DBLweightedImpurity < l_DBLimpurity)
                        {
                            l_DBLimpurity = l_DBLweightedImpurity;
                            l_INTbestFeatureIndex = i;
                            l_OBJbestThreshold = l_DBLthreshold;
                            l_COLLleftPairs = l_COLLsplits[0];
                            l_COLLrightPairs = l_COLLsplits[1];
                        }
                    }
                }
                //If it's not a numeric feature we treat it as categorical
                else
                {
                    //Get a hashset of all the unique values for the feature
                    HashSet<object?> l_COLLthresholds = new HashSet<object?>(l_COLLconvertedArrays
                        .Select(row => (row as Array)?.GetValue(i))
                        .ToList()
                    );

                    //test each unique value as a threshold
                    foreach (object l_OBJthreshold in l_COLLthresholds)
                    {
                        //this series of LINQ statements will split the dataset into values equal to the threshold and values not equal to the threshold
                        Dictionary<int, List<KeyValuePair<object, object?>>> l_COLLsplits = l_COLLconvertedArrays
                            .Select((row, index) =>
                            {
                                object? value = null;
                                object key = null;
                                if (row is Array arr)
                                {
                                    value = arr.GetValue(i);
                                    key = l_COLLclassifications.ElementAt(index);
                                }
                                return (value == l_OBJthreshold) ? (0, new KeyValuePair<object, object?>(key, row)) : (1, new KeyValuePair<object, object?>(key, row));
                            })
                            .Where(pair => pair.Item1 >= 0)
                            .GroupBy(pair => pair.Item1)
                            .ToDictionary(g => g.Key, g => g.Select(v => v.Item2).ToList());

                        //these if blocks are necessary incase all the data flows into one branch.
                        if (!l_COLLsplits.ContainsKey(0))
                        {
                            l_COLLsplits[0] = new List<KeyValuePair<object, object?>>();
                        }
                        if (!l_COLLsplits.ContainsKey(1))
                        {
                            l_COLLsplits[1] = new List<KeyValuePair<object, object?>>();
                        }

                        //Perform the impurity calculations, we have used weighted Gini Impurity for our model.
                        double l_DBLleftImpurity = l_COLLsplits[0].Any() ? CalcGiniImpurity(l_COLLsplits[0].Select(row => { return row.Key; })) : 0;
                        double l_DBLrightImpurity = l_COLLsplits[1].Any() ? CalcGiniImpurity(l_COLLsplits[1].Select(row => { return row.Key; })) : 0;

                        double l_DBLweightedImpurity = (l_COLLsplits[0].Count() * l_DBLleftImpurity + l_COLLsplits[1].Count() * l_DBLrightImpurity) / l_COLLconvertedArrays.Count();

                        //see if this split is better than the current best
                        if (l_DBLweightedImpurity < l_DBLimpurity)
                        {
                            l_DBLimpurity = l_DBLweightedImpurity;
                            l_INTbestFeatureIndex = i;
                            l_OBJbestThreshold = l_OBJthreshold;
                            l_COLLleftPairs = l_COLLsplits[0];
                            l_COLLrightPairs = l_COLLsplits[1];
                        }
                    }
                }
            }
            //create and return our NodeBud
            return new NodeBud(l_DBLimpurity, l_INTbestFeatureIndex, l_OBJbestThreshold, l_COLLleftPairs, l_COLLrightPairs);
        }

        /// <summary>
        /// Method to create a subset of available features. Method is a little clunky as when I designed this library I initially tried to make it handle objects and arrays.
        /// Were I to create further iterations I would likely abandon this methodology and instead force the end user to put their data into DataTable objects to allow better control over data handling within and between methods.
        /// </summary>
        /// <param name="r_COLLdata">Collection of data we're working with</param>
        /// <returns>Subset of <paramref name="r_COLLdata"/> containing only a partial number of the available features</returns>
        private IEnumerable<object> SubsetFeatures(IEnumerable<object> r_COLLdata)
        {
            //First we check if the data is in arrays or objects
            if (r_COLLdata.First() is Array)
            {
                //if we are dealing with arrays, we use the first one to get our list of features
                Array l_COLLfirstArray = (Array)r_COLLdata.First();

                int l_INTnumFeatures = l_COLLfirstArray.Length;

                //We're using roughly 1/3 of the available features at each node
                int l_INTnumFeaturesOutput = l_INTnumFeatures / 3;

                //Random value for selecting features
                Random l_OBJrandom = new Random();

                //list to hold indices of selected features
                List<int> l_COLLindexes = new List<int>();

                //loop through random feature indices until we have the requisite number for our subset.
                while (l_COLLindexes.Count < l_INTnumFeaturesOutput)
                {
                    int l_INTnextRando = l_OBJrandom.Next(l_INTnumFeatures);

                    if (!l_COLLindexes.Contains(l_INTnextRando))
                    {
                        l_COLLindexes.Add(l_INTnextRando);
                    }
                }

                //Build our new data collection including only the selected features.
                return r_COLLdata.Select(row =>
                {
                    Array l_COLLarray = (Array)row;

                    object[] l_COLLnewArray = new object[l_INTnumFeaturesOutput];

                    for (int i = 0; i < l_COLLindexes.Count; i++)
                    {
                        l_COLLnewArray[i] = l_COLLarray.GetValue(l_COLLindexes[i]);
                    }
                    return (object)l_COLLnewArray;
                });
            }
            //if we don't have a collection of arrays we assume it's a collection of objects where the properties = our data features
            else
            {
                //variable to hold the number of features present
                int l_INTnumFeatures = 0;
                //variable to hold the number of features present in our output
                int l_INTnumFeaturesOutput = 0;
                //for randomness
                Random l_OBJrandom = new Random();

                //use the first object in the list to get our list of features
                IEnumerable<List<object>> l_COLLbuffer = r_COLLdata.Select(row =>
                {
                    //using reflection to get a list of properties.
                    PropertyInfo[] props = row.GetType().GetProperties(BindingFlags.Public | BindingFlags.NonPublic | BindingFlags.Instance);

                    List<object> values = new List<object>();

                    foreach (PropertyInfo prop in props)
                    {
                        values.Add(prop.GetValue(row, null));
                    }

                    l_INTnumFeatures = values.Count;

                    //use roughly 1/3 of the available features
                    l_INTnumFeaturesOutput = l_INTnumFeatures / 3;

                    return values;
                }).ToList();

                //collection to hold indexes of features
                List<int> l_COLLindexes = new List<int>();

                //loop through random feature indices until we have the requisite number for our subset.
                while (l_COLLindexes.Count < l_INTnumFeaturesOutput)
                {
                    int l_INTnextRando = l_OBJrandom.Next(l_INTnumFeatures);

                    if (!l_COLLindexes.Contains(l_INTnextRando))
                    {
                        l_COLLindexes.Add(l_INTnextRando);
                    }
                }

                //Build our new data collection including only the selected features.
                IEnumerable<object> x = l_COLLbuffer.Select(row =>
                {
                    Array l_COLLarray = row.ToArray();

                    object[] l_COLLnewArray = new object[l_INTnumFeaturesOutput];

                    for (int i = 0; i < l_COLLindexes.Count; i++)
                    {
                        l_COLLnewArray[i] = l_COLLarray.GetValue(l_COLLindexes[i]);
                    }

                    return (object)l_COLLnewArray;
                }).ToList();

                return x;
            }
        }

        /// <summary>
        /// Takes a collection of features and returns the Gini Impurity which is 1 - the sum of the proportion of records containing the each feature squared.
        /// 1 - ( (rowsWithFeatureOne/totalRows)^2 + (rowsWithFeatureTwo/totalRows)^2...+ (rowsWithFeatureN/totalRows)^2 )
        /// </summary>
        /// <param name="l_ENUMclassifications"></param>
        /// <returns type="double">double representing Gini Impurity for the collection.</returns>
        internal double CalcGiniImpurity(IEnumerable<object> l_ENUMclassifications)
        {

            double l_DBLimpurity = 1.00;
            int l_INTclassCount = l_ENUMclassifications.Count();

            //The impurity of an empty set is 0
            if (l_INTclassCount == 0)
            {
                l_DBLimpurity = 0;
            }

            //Count the occurences
            Dictionary<object, int> l_DICTclassCounts = l_ENUMclassifications.GroupBy(c => c).ToDictionary(g => g.Key, g => g.Count());

            //Perform the calculation
            foreach (object classification in l_DICTclassCounts.Keys)
            {
                double l_DBLproportion = (double)l_DICTclassCounts[classification] / l_INTclassCount;
                l_DBLimpurity -= l_DBLproportion * l_DBLproportion;
            }

            return l_DBLimpurity;
        }`}
                    </SyntaxHighlighter>
                </div>
            </MainContent>
        </div>
    );
}

export default Model;