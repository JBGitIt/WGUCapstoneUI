using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using RandomForest;
using System.Data;
using WGUCapstoneUI.Server.Classes;
using Newtonsoft.Json;
using Microsoft.Data.SqlClient;
using System.Diagnostics;
using System;
using Microsoft.AspNetCore.Mvc.ModelBinding.Metadata;

namespace WGUCapstoneUI.Server.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class MLController : ControllerBase
    {
        string l_STRapiKey = "10048f9b5d22064ad5b617fafce15bb4";
        string l_STRservName = "";
        List<string> l_COLLquarterlySeries = new List<string> { "EXPGS", "GDP", "IMPGS", };
        private readonly IHostEnvironment _env;

        public MLController(IHostEnvironment env)
        {
            _env = env;
            if (_env.IsDevelopment())
            {
                l_STRservName = "localhost";
            }
            else if (_env.IsProduction())
            {
                l_STRservName = "VMI2364899\\SQLEXPRESS";
            }
        }
        
        

        [HttpGet("raw")]
        public IActionResult GetRawData(string l_STRseries)
        {
            //DataTable for sending our extracted data to the DB
            DataTable l_OBJtable = new DataTable();
            l_OBJtable.Columns.Add("Date", Type.GetType("System.String"));
            l_OBJtable.Columns.Add("Value", Type.GetType("System.Double"));

            HashSet<KeyValuePair<string, double>> l_COLLobservations = new HashSet<KeyValuePair<string, double>>();

            //HttpRequest to FRED API
            using (HttpClient l_OBJclient = new HttpClient())
            {
                HttpResponseMessage l_OBJresponse = l_OBJclient.GetAsync($"https://api.stlouisfed.org/fred/series/observations?series_id={l_STRseries}&sort_order=asc&api_key={l_STRapiKey}&file_type=json").GetAwaiter().GetResult();

                //Parse the returned JSON into custom classes
                FREDOut l_OBJapiOutput = JsonConvert.DeserializeObject<FREDOut>(l_OBJresponse.Content.ReadAsStringAsync().GetAwaiter().GetResult());

                //Parse the necessary information from the resultant objects
                double l_DBLvalue = 0;
                DateTime l_OBJdt = DateTime.Now;
                l_COLLobservations = l_OBJapiOutput.observations.Where(row => { return (double.TryParse(row.value, out l_DBLvalue) && DateTime.TryParse(row.date, out l_OBJdt)); })
                    .Select(row =>
                    {
                        return new KeyValuePair<string, double>(DateTime.Parse(row.date).ToShortDateString(), double.Parse(row.value));
                    }).ToHashSet();

                //Turn it into DataRows in our DataTable so we can send it off to the DB
                foreach (KeyValuePair<string, double> kvp in l_COLLobservations)
                {
                    l_OBJtable.Rows.Add(new object[] { kvp.Key, kvp.Value });
                }
            }

            //Connect to the SQL DB
            using (SqlConnection l_OBJsqlConn = new SqlConnection($"Server={l_STRservName}; Database=WGUCapstone; Integrated Security=True; Trust Server Certificate=True"))
            {
                l_OBJsqlConn.Open();

                //Use procedure that accepts table parameter to send our data over
                SqlCommand l_OBJsqlComm = new SqlCommand($"CapstoneUI.ins{l_STRseries}", l_OBJsqlConn);
                l_OBJsqlComm.Parameters.Add(new SqlParameter("@apiRecord", l_OBJtable));
                l_OBJsqlComm.CommandType = CommandType.StoredProcedure;
                int l_INTrowsOut = l_OBJsqlComm.ExecuteNonQuery();
            }

            //Return the data to the caller of our method
            return Ok(l_OBJtable.AsEnumerable().Select((row) => new
            {
                 Date = row["Date"]
                ,Value = row["Value"]
            }).ToList());
        }

        [HttpGet("adjusted")]
        public async Task<IActionResult> TimeAdjustData(string l_STRseries, CancellationToken cancellationToken)
        {
            string[] l_ARRlongRunners = { "EXPGS", "GDP", "IMPGS" };

            CancellationToken l_OBJusedToken = cancellationToken;

            if (l_ARRlongRunners.Contains(l_STRseries))
            {
                using CancellationTokenSource l_OBJcts = new CancellationTokenSource(TimeSpan.FromSeconds(180));
                using CancellationTokenSource l_OBJlinkedCTS = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken, l_OBJcts.Token);

                l_OBJusedToken = l_OBJlinkedCTS.Token;
            }


            //method code
            //DataTable object to hold the data we are returning
            DataTable l_OBJreturnTable = new DataTable();
            l_OBJreturnTable.Columns.Add(new DataColumn("Date", Type.GetType("System.DateTime")));
            l_OBJreturnTable.Columns.Add(new DataColumn("Value", Type.GetType("System.Decimal")));

            //Call SQL stored procedure to adjust the data to match the Master dates
            using (SqlConnection l_OBJsqlConn = new SqlConnection($"Server={l_STRservName}; Database=WGUCapstone; Integrated Security=True; Trust Server Certificate=True"))
            {
                l_OBJsqlConn.Open();

                SqlCommand l_OBJsqlComm = l_OBJsqlConn.CreateCommand();

                l_OBJsqlComm.CommandText = $"CapstoneUI.ins{l_STRseries}Adjusted";

                l_OBJsqlComm.CommandType = CommandType.StoredProcedure;

                l_OBJsqlComm.CommandTimeout = 180;

                using (SqlDataReader l_OBJsqlDataRdr = await l_OBJsqlComm.ExecuteReaderAsync(l_OBJusedToken))
                {
                    //Feed our resultant data into our Datatable
                    while (l_OBJsqlDataRdr.Read())
                    {
                        DataRow l_OBJnewRow = l_OBJreturnTable.NewRow();
                        l_OBJnewRow.SetField("Date", l_OBJsqlDataRdr.GetDateTime(0));
                        l_OBJnewRow.SetField("Value", l_OBJsqlDataRdr.GetDecimal(1));
                        l_OBJreturnTable.Rows.Add(l_OBJnewRow);
                    }
                }

                l_OBJsqlConn.Close();
            }

            //return our data to the web app
            return Ok(l_OBJreturnTable.AsEnumerable().Select(row => new
            {
                 Date = row["Date"]
                ,Value = row["Value"]
            }).ToList());
        }

        [HttpGet("suplearn")]
        public IActionResult SupervisedLearning()
        {
            DataTable l_OBJreturnTable = new DataTable();
            l_OBJreturnTable.Columns.Add(new DataColumn("T1_Date", Type.GetType("System.DateTime")));
            l_OBJreturnTable.Columns.Add(new DataColumn("T1_BUSLOANSBillions", Type.GetType("System.Decimal")));
            l_OBJreturnTable.Columns.Add(new DataColumn("T1_CPIAUCSL", Type.GetType("System.Decimal")));
            l_OBJreturnTable.Columns.Add(new DataColumn("T1_DPRIMEPercent", Type.GetType("System.Decimal")));
            l_OBJreturnTable.Columns.Add(new DataColumn("T1_DPSACBW027SBOGBillions", Type.GetType("System.Decimal")));
            l_OBJreturnTable.Columns.Add(new DataColumn("T1_EXPGSBillions", Type.GetType("System.Decimal")));
            l_OBJreturnTable.Columns.Add(new DataColumn("T1_IMPGSBillions", Type.GetType("System.Decimal")));
            l_OBJreturnTable.Columns.Add(new DataColumn("T1_RHEACBW027SBOGBillions", Type.GetType("System.Decimal")));
            l_OBJreturnTable.Columns.Add(new DataColumn("T1_TLRESCONBillions", Type.GetType("System.Decimal")));
            l_OBJreturnTable.Columns.Add(new DataColumn("T1_UNRATEPercent", Type.GetType("System.Decimal")));
            l_OBJreturnTable.Columns.Add(new DataColumn("T1_GDPBillions", Type.GetType("System.Decimal")));
            l_OBJreturnTable.Columns.Add(new DataColumn("T2_Date", Type.GetType("System.DateTime")));
            l_OBJreturnTable.Columns.Add(new DataColumn("T2_BUSLOANSBillions", Type.GetType("System.Decimal")));
            l_OBJreturnTable.Columns.Add(new DataColumn("T2_BUSLOANSPercentChange", Type.GetType("System.Decimal")));
            l_OBJreturnTable.Columns.Add(new DataColumn("T2_CPIAUCSL", Type.GetType("System.Decimal")));
            l_OBJreturnTable.Columns.Add(new DataColumn("T2_CPIAUCSLPercentChange", Type.GetType("System.Decimal")));
            l_OBJreturnTable.Columns.Add(new DataColumn("T2_DPRIMEPercent", Type.GetType("System.Decimal")));
            l_OBJreturnTable.Columns.Add(new DataColumn("T2_DPRIMEPercentChange", Type.GetType("System.Decimal")));
            l_OBJreturnTable.Columns.Add(new DataColumn("T2_DPSACBW027SBOGBillions", Type.GetType("System.Decimal")));
            l_OBJreturnTable.Columns.Add(new DataColumn("T2_DPSACBW027SBOGPercentChange", Type.GetType("System.Decimal")));
            l_OBJreturnTable.Columns.Add(new DataColumn("T2_EXPGSBillions", Type.GetType("System.Decimal")));
            l_OBJreturnTable.Columns.Add(new DataColumn("T2_EXPGSPercentChange", Type.GetType("System.Decimal")));
            l_OBJreturnTable.Columns.Add(new DataColumn("T2_IMPGSBillions", Type.GetType("System.Decimal")));
            l_OBJreturnTable.Columns.Add(new DataColumn("T2_IMPGSPercentChange", Type.GetType("System.Decimal")));
            l_OBJreturnTable.Columns.Add(new DataColumn("T2_RHEACBW027SBOGBillions", Type.GetType("System.Decimal")));
            l_OBJreturnTable.Columns.Add(new DataColumn("T2_RHEACBW027SBOGPercentChange", Type.GetType("System.Decimal")));
            l_OBJreturnTable.Columns.Add(new DataColumn("T2_TLRESCONBillions", Type.GetType("System.Decimal")));
            l_OBJreturnTable.Columns.Add(new DataColumn("T2_TLRESCONPercentChange", Type.GetType("System.Decimal")));
            l_OBJreturnTable.Columns.Add(new DataColumn("T2_UNRATEPercent", Type.GetType("System.Decimal")));
            l_OBJreturnTable.Columns.Add(new DataColumn("T2_UNRATEPercentChange", Type.GetType("System.Decimal")));
            l_OBJreturnTable.Columns.Add(new DataColumn("T2_GDPBillions", Type.GetType("System.Decimal")));
            l_OBJreturnTable.Columns.Add(new DataColumn("T2_GDPPercentChange", Type.GetType("System.Decimal")));
            l_OBJreturnTable.Columns.Add(new DataColumn("T3_GDPBillions", Type.GetType("System.Decimal")));
            l_OBJreturnTable.Columns.Add(new DataColumn("T3_GDPPercentChange", Type.GetType("System.Decimal")));

            using (SqlConnection l_OBJsqlConn = new SqlConnection($"Server={l_STRservName}; Database=WGUCapstone; Integrated Security=True; Trust Server Certificate=True"))
            {
                l_OBJsqlConn.Open();

                SqlCommand l_OBJsqlComm = l_OBJsqlConn.CreateCommand();

                l_OBJsqlComm.CommandText = $"CapstoneUI.insSupervisedLearning";

                l_OBJsqlComm.CommandType = CommandType.StoredProcedure;

                using (SqlDataReader l_OBJsqlDataRdr = l_OBJsqlComm.ExecuteReader())
                {
                    while (l_OBJsqlDataRdr.Read())
                    {
                        DataRow l_OBJnewRow = l_OBJreturnTable.NewRow();
                        l_OBJnewRow.SetField("T1_Date", l_OBJsqlDataRdr.GetDateTime(0));
                        l_OBJnewRow.SetField("T1_BUSLOANSBillions", l_OBJsqlDataRdr.GetDecimal(1));
                        l_OBJnewRow.SetField("T1_CPIAUCSL", l_OBJsqlDataRdr.GetDecimal(2));
                        l_OBJnewRow.SetField("T1_DPRIMEPercent", l_OBJsqlDataRdr.GetDecimal(3));
                        l_OBJnewRow.SetField("T1_DPSACBW027SBOGBillions", l_OBJsqlDataRdr.GetDecimal(4));
                        l_OBJnewRow.SetField("T1_EXPGSBillions", l_OBJsqlDataRdr.GetDecimal(5));
                        l_OBJnewRow.SetField("T1_IMPGSBillions", l_OBJsqlDataRdr.GetDecimal(6));
                        l_OBJnewRow.SetField("T1_RHEACBW027SBOGBillions", l_OBJsqlDataRdr.GetDecimal(7));
                        l_OBJnewRow.SetField("T1_TLRESCONBillions", l_OBJsqlDataRdr.GetDecimal(8));
                        l_OBJnewRow.SetField("T1_UNRATEPercent", l_OBJsqlDataRdr.GetDecimal(9));
                        l_OBJnewRow.SetField("T1_GDPBillions", l_OBJsqlDataRdr.GetDecimal(10));
                        l_OBJnewRow.SetField("T2_Date", l_OBJsqlDataRdr.GetDateTime(11));
                        l_OBJnewRow.SetField("T2_BUSLOANSBillions", l_OBJsqlDataRdr.GetDecimal(12));
                        l_OBJnewRow.SetField("T2_BUSLOANSPercentChange", l_OBJsqlDataRdr.GetDecimal(13));
                        l_OBJnewRow.SetField("T2_CPIAUCSL", l_OBJsqlDataRdr.GetDecimal(14));
                        l_OBJnewRow.SetField("T2_CPIAUCSLPercentChange", l_OBJsqlDataRdr.GetDecimal(15));
                        l_OBJnewRow.SetField("T2_DPRIMEPercent", l_OBJsqlDataRdr.GetDecimal(16));
                        l_OBJnewRow.SetField("T2_DPRIMEPercentChange", l_OBJsqlDataRdr.GetDecimal(17));
                        l_OBJnewRow.SetField("T2_DPSACBW027SBOGBillions", l_OBJsqlDataRdr.GetDecimal(18));
                        l_OBJnewRow.SetField("T2_DPSACBW027SBOGPercentChange", l_OBJsqlDataRdr.GetDecimal(19));
                        l_OBJnewRow.SetField("T2_EXPGSBillions", l_OBJsqlDataRdr.GetDecimal(20));
                        l_OBJnewRow.SetField("T2_EXPGSPercentChange", l_OBJsqlDataRdr.GetDecimal(21));
                        l_OBJnewRow.SetField("T2_IMPGSBillions", l_OBJsqlDataRdr.GetDecimal(22));
                        l_OBJnewRow.SetField("T2_IMPGSPercentChange", l_OBJsqlDataRdr.GetDecimal(23));
                        l_OBJnewRow.SetField("T2_RHEACBW027SBOGBillions", l_OBJsqlDataRdr.GetDecimal(24));
                        l_OBJnewRow.SetField("T2_RHEACBW027SBOGPercentChange", l_OBJsqlDataRdr.GetDecimal(25));
                        l_OBJnewRow.SetField("T2_TLRESCONBillions", l_OBJsqlDataRdr.GetDecimal(26));
                        l_OBJnewRow.SetField("T2_TLRESCONPercentChange", l_OBJsqlDataRdr.GetDecimal(27));
                        l_OBJnewRow.SetField("T2_UNRATEPercent", l_OBJsqlDataRdr.GetDecimal(28));
                        l_OBJnewRow.SetField("T2_UNRATEPercentChange", l_OBJsqlDataRdr.GetDecimal(29));
                        l_OBJnewRow.SetField("T2_GDPBillions", l_OBJsqlDataRdr.GetDecimal(30));
                        l_OBJnewRow.SetField("T2_GDPPercentChange", l_OBJsqlDataRdr.GetDecimal(31));
                        l_OBJnewRow.SetField("T3_GDPBillions", l_OBJsqlDataRdr.GetDecimal(32));
                        l_OBJnewRow.SetField("T3_GDPPercentChange", l_OBJsqlDataRdr.GetDecimal(33));
                        l_OBJreturnTable.Rows.Add(l_OBJnewRow);
                    }
                }

                l_OBJsqlConn.Close();
            }

            return Ok(l_OBJreturnTable.AsEnumerable().Select(row => new
            {
                 T1_Date = ((DateTime)row["T1_Date"]).ToShortDateString()
                ,T1_BUSLOANSBillions = row["T1_BUSLOANSBillions"]
                ,T1_CPIAUCSL = row["T1_CPIAUCSL"]
                ,T1_DPRIMEPercent = row["T1_DPRIMEPercent"]
                ,T1_DPSACBW027SBOGBillions = row["T1_DPSACBW027SBOGBillions"]
                ,T1_EXPGSBillions = row["T1_EXPGSBillions"]
                ,T1_IMPGSBillions = row["T1_IMPGSBillions"]
                ,T1_RHEACBW027SBOGBillions = row["T1_RHEACBW027SBOGBillions"]
                ,T1_TLRESCONBillions = row["T1_TLRESCONBillions"]
                ,T1_UNRATEPercent = row["T1_UNRATEPercent"]
                ,T1_GDPBillions = row["T1_GDPBillions"]
                ,T2_Date = ((DateTime)row["T2_Date"]).ToShortDateString()
                ,T2_BUSLOANSBillions = row["T2_BUSLOANSBillions"]
                ,T2_BUSLOANSPercentChange = row["T2_BUSLOANSPercentChange"]
                ,T2_CPIAUCSL = row["T2_CPIAUCSL"]
                ,T2_CPIAUCSLPercentChange = row["T2_CPIAUCSLPercentChange"]
                ,T2_DPRIMEPercent = row["T2_DPRIMEPercent"]
                ,T2_DPRIMEPercentChange = row["T2_DPRIMEPercentChange"]
                ,T2_DPSACBW027SBOGBillions = row["T2_DPSACBW027SBOGBillions"]
                ,T2_DPSACBW027SBOGPercentChange = row["T2_DPSACBW027SBOGPercentChange"]
                ,T2_EXPGSBillions = row["T2_EXPGSBillions"]
                ,T2_EXPGSPercentChange = row["T2_EXPGSPercentChange"]
                ,T2_IMPGSBillions = row["T2_IMPGSBillions"]
                ,T2_IMPGSPercentChange = row["T2_IMPGSPercentChange"]
                ,T2_RHEACBW027SBOGBillions = row["T2_RHEACBW027SBOGBillions"]
                ,T2_RHEACBW027SBOGPercentChange = row["T2_RHEACBW027SBOGPercentChange"]
                ,T2_TLRESCONBillions = row["T2_TLRESCONBillions"]
                ,T2_TLRESCONPercentChange = row["T2_TLRESCONPercentChange"]
                ,T2_UNRATEPercent = row["T2_UNRATEPercent"]
                ,T2_UNRATEPercentChange = row["T2_UNRATEPercentChange"]
                ,T2_GDPBillions = row["T2_GDPBillions"]
                ,T2_GDPPercentChange = row["T2_GDPPercentChange"]
                ,T3_GDPBillions = row["T3_GDPBillions"]
                ,T3_GDPPercentChange = row["T3_GDPPercentChange"]
            }).ToList());
        }

        [HttpGet("trainmodel")]
        public IActionResult TrainModel()
        {
            Random rand = new Random();

            IEnumerable<object> l_COLLdata = new List<object>();
            IEnumerable<object> l_COLLclassifications = new List<object>();
            IEnumerable<object> l_COLLclassificationAmounts = new List<object>();
            IEnumerable<object> l_COLLdataAmounts = new List<object>();
            IEnumerable<DateTime> l_COLLdates = new List<DateTime>();

            DataTable l_OBJtrainingDatesTbl = new DataTable();
            l_OBJtrainingDatesTbl.Columns.Add(new DataColumn("T2_Date", Type.GetType("System.DateTime")));

            using (SqlConnection l_OBJsqlConn = new SqlConnection($"Server={l_STRservName};Database=WGUCapstone;Integrated Security=True;TrustServerCertificate=True"))
            {
                l_OBJsqlConn.Open();

                SqlCommand l_OBJsqlCmd = l_OBJsqlConn.CreateCommand();
                l_OBJsqlCmd.CommandText = "dbo.spSEL_GetData";
                l_OBJsqlCmd.CommandType = System.Data.CommandType.StoredProcedure;

                BuildTrainingSets(l_OBJsqlCmd, ref l_COLLdata, ref l_COLLclassifications, ref l_COLLdates, ref l_COLLdataAmounts, ref l_COLLclassificationAmounts);

                l_OBJsqlConn.Close();
            }

            IEnumerable<object> l_COLLtrainData = l_COLLdata.Take(l_COLLdata.Count() / 2);
            IEnumerable<object> l_COLLtrainClassifications = l_COLLclassifications.Take(l_COLLdata.Count() / 2);
            IEnumerable<object> l_COLLtrainClassAmounts = l_COLLclassificationAmounts.Take(l_COLLclassificationAmounts.Count() / 2);
            IEnumerable<object> l_COLLtrainDataAmounts = l_COLLdataAmounts.Take(l_COLLdataAmounts.Count() / 2);
            List<DateTime> l_COLLtrainDates = l_COLLdates.Take(l_COLLdata.Count() / 2).ToList();

            foreach (DateTime l_OBJdate in l_COLLtrainDates)
            {
                DataRow l_OBJnewRow = l_OBJtrainingDatesTbl.NewRow();
                l_OBJnewRow.SetField<DateTime>("T2_Date", l_OBJdate);
                l_OBJtrainingDatesTbl.Rows.Add(l_OBJnewRow);
            }

            int l_INTrfID = 0;
            int l_INTrfVer = 0;

            using (SqlConnection l_OBJsqlConn = new SqlConnection($"Server={l_STRservName};Database=WGUCapstone;Integrated Security=True;TrustServerCertificate=True"))
            {
                l_OBJsqlConn.Open();
                SqlCommand l_OBJsqlComm = l_OBJsqlConn.CreateCommand();
                l_OBJsqlComm.CommandType = CommandType.StoredProcedure;
                l_OBJsqlComm.CommandText = "CapstoneUI.updSetTrainingData";
                l_OBJsqlComm.Parameters.Add(new SqlParameter("@TrainingDates", l_OBJtrainingDatesTbl));
                l_OBJsqlComm.Parameters.Add(new SqlParameter("@OriginalTraining", 1));

                using (SqlDataReader l_OBJrdr = l_OBJsqlComm.ExecuteReader())
                {
                    while (l_OBJrdr.Read())
                    {
                        l_INTrfID = l_OBJrdr.GetInt32(0);
                        l_INTrfVer = l_OBJrdr.GetInt32(1);
                    }
                }

                l_OBJsqlConn.Close();
            }

            Arborist l_OBJarborist = new Arborist(l_COLLtrainData, l_COLLtrainClassifications, 1000, 100, 2);

            l_OBJarborist.PlantForestTimeSeries(12, 12);

            foreach (DecisionTree l_OBJtree in l_OBJarborist.Forest)
            {
                ExpandAndSubmitTree(l_OBJtree, l_INTrfID, l_INTrfVer);
            }

            return Ok(new {ModelID = l_INTrfID, Version = l_INTrfVer});
        }

        [HttpGet("getmodels")]
        public IActionResult GetModelVersions()
        {
            Dictionary<int, List<ForestFromDB>> l_COLLmodelsAndVersions = new Dictionary<int, List<ForestFromDB>>();

            using (SqlConnection l_OBJsqlConn = new SqlConnection($"Server={l_STRservName};Database=WGUCapstone;Integrated Security=True;TrustServerCertificate=True"))
            {
                l_OBJsqlConn.Open();
                SqlCommand l_OBJsqlComm = l_OBJsqlConn.CreateCommand();
                l_OBJsqlComm.CommandType = CommandType.StoredProcedure;
                l_OBJsqlComm.CommandText = "CapstoneUI.selGetModelsAndVersions";

                using (SqlDataReader l_OBJrdr = l_OBJsqlComm.ExecuteReader())
                {
                    while (l_OBJrdr.Read())
                    {
                        int l_INTmodelNum = l_OBJrdr.GetInt32(0);
                        if (!l_COLLmodelsAndVersions.ContainsKey(l_INTmodelNum))
                        {
                            l_COLLmodelsAndVersions.Add(l_INTmodelNum, new List<ForestFromDB>());
                        }

                        l_COLLmodelsAndVersions[l_INTmodelNum].Add(new ForestFromDB(l_OBJrdr.GetInt32(1), l_OBJrdr.GetDateTime(2), l_OBJrdr.IsDBNull(3) ? decimal.MinValue : l_OBJrdr.GetDecimal(3)));
                    }
                }
            }
            return Ok(JsonConvert.SerializeObject(l_COLLmodelsAndVersions));
        }

        [HttpGet("validate")]
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

            using (SqlConnection l_OBJsqlConn = new SqlConnection($"Server={l_STRservName}; Database=WGUCapstone; Integrated Security=True; Trust Server Certificate=True"))
            {
                l_OBJsqlConn.Open();

                SqlCommand l_OBJsqlCmd = l_OBJsqlConn.CreateCommand();

                l_OBJsqlCmd.CommandText = "CapstoneUI.selGetValidationData";
                l_OBJsqlCmd.CommandType = CommandType.StoredProcedure;

                l_OBJsqlCmd.Parameters.Add(new SqlParameter("@ForestID", v_INTforestID));
                l_OBJsqlCmd.Parameters.Add(new SqlParameter("@VersionID", v_INTforestVersion));

                BuildTrainingSets(l_OBJsqlCmd, ref l_COLLtestData, ref l_COLLtestClassifications, ref l_COLLtestDates, ref l_COLLtestDataAmounts, ref l_COLLtestClassAmounts);
            }

            using (SqlConnection l_OBJsqlConn = new SqlConnection($"Server={l_STRservName}; Database=WGUCapstone; Integrated Security=True; Trust Server Certificate=True"))
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
                using (SqlConnection l_OBJsqlConn = new SqlConnection($"Server={l_STRservName}; Database=WGUCapstone; Integrated Security=True; Trust Server Certificate=True"))
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

                using (SqlConnection l_OBJsqlConnection = new SqlConnection($"Server={l_STRservName};Database=WGUCapstone;Integrated Security=True;TrustServerCertificate=True"))
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
                using (SqlConnection l_OBJsqlConnection = new SqlConnection($"Server={l_STRservName};Database=WGUCapstone;Integrated Security=True;TrustServerCertificate=True"))
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
        }

        [HttpGet("validateChart")]
        public IActionResult GetValidationData(int v_INTforestID, int v_INTforestVersion)
        {
            DataTable l_OBJpredictionTable = new DataTable();
            l_OBJpredictionTable.Columns.Add("RandomForestID", Type.GetType("System.Int32"));
            l_OBJpredictionTable.Columns.Add("Version", Type.GetType("System.Int32"));
            l_OBJpredictionTable.Columns.Add("AsOfDate", Type.GetType("System.String"));
            l_OBJpredictionTable.Columns.Add("PredictedGDP", Type.GetType("System.Double"));
            l_OBJpredictionTable.Columns.Add("RangeHigh", Type.GetType("System.Double"));
            l_OBJpredictionTable.Columns.Add("RangeLow", Type.GetType("System.Double"));
            l_OBJpredictionTable.Columns.Add("Actual", Type.GetType("System.Double"));
            l_OBJpredictionTable.Columns.Add("isCorrect", Type.GetType("System.Boolean"));

            using (SqlConnection l_OBJsqlConnection = new SqlConnection($"Server={l_STRservName};Database=WGUCapstone;Integrated Security=True;TrustServerCertificate=True"))
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
                        l_OBJnewRow.SetField("AsOfDate", l_OBJsqlRdr.GetDateTime(0).ToShortDateString());
                        l_OBJnewRow.SetField("PredictedGDP", l_OBJsqlRdr.GetDecimal(1));
                        l_OBJnewRow.SetField("RangeHigh", l_OBJsqlRdr.GetDecimal(2));
                        l_OBJnewRow.SetField("RangeLow", l_OBJsqlRdr.GetDecimal(3));
                        l_OBJnewRow.SetField("Actual", l_OBJsqlRdr.GetDecimal(4));
                        l_OBJnewRow.SetField("isCorrect", l_OBJsqlRdr.GetBoolean(5));
                        l_OBJpredictionTable.Rows.Add(l_OBJnewRow);
                    }
                }
            }

            return Ok(l_OBJpredictionTable.AsEnumerable().Select((row) => new
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
            }).ToList());
        }

        [HttpGet("mostRecentData")]
        public IActionResult GetNewData()
        {
            List<string> l_COLLseries = new List<string> { "BUSLOANS", "CPIAUCSL", "DPRIME", "DPSACBW027SBOG", "EXPGS", "IMPGS", "RHEACBW027SBOG", "TLRESCON", "UNRATE" };

            Dictionary<string, KeyValuePair<DateTime, decimal>> l_COLLnewValues = new Dictionary<string, KeyValuePair<DateTime, decimal>>();

            HashSet<KeyValuePair<DateTime, double>> l_COLLobservations = new HashSet<KeyValuePair<DateTime, double>>();

            DateTime l_OBJmostRecentDate = DateTime.Now;
            
            using (SqlConnection l_OBJsqlConn = new SqlConnection($"Server={l_STRservName}; Database=WGUCapstone; Integrated Security=True; Trust Server Certificate=True"))
            {
                l_OBJsqlConn.Open();

                SqlCommand l_OBJsqlCmd = l_OBJsqlConn.CreateCommand();

                l_OBJsqlCmd.CommandType = CommandType.StoredProcedure;

                l_OBJsqlCmd.CommandText = "CapstoneUI.selMostRecentDate";

                using (SqlDataReader l_OBJsqlRdr = l_OBJsqlCmd.ExecuteReader())
                {
                    while (l_OBJsqlRdr.Read())
                    {
                        l_COLLnewValues.Add(l_OBJsqlRdr.GetName(1), new KeyValuePair<DateTime, decimal>(l_OBJsqlRdr.GetDateTime(0), l_OBJsqlRdr.GetDecimal(1)));
                        l_COLLnewValues.Add(l_OBJsqlRdr.GetName(3), new KeyValuePair<DateTime, decimal>(l_OBJsqlRdr.GetDateTime(0), l_OBJsqlRdr.GetDecimal(3)));
                        l_COLLnewValues.Add(l_OBJsqlRdr.GetName(5), new KeyValuePair<DateTime, decimal>(l_OBJsqlRdr.GetDateTime(0), l_OBJsqlRdr.GetDecimal(5)));
                        l_COLLnewValues.Add(l_OBJsqlRdr.GetName(7), new KeyValuePair<DateTime, decimal>(l_OBJsqlRdr.GetDateTime(0), l_OBJsqlRdr.GetDecimal(7)));
                        l_COLLnewValues.Add(l_OBJsqlRdr.GetName(9), new KeyValuePair<DateTime, decimal>(l_OBJsqlRdr.GetDateTime(0), l_OBJsqlRdr.GetDecimal(9)));
                        l_COLLnewValues.Add(l_OBJsqlRdr.GetName(11), new KeyValuePair<DateTime, decimal>(l_OBJsqlRdr.GetDateTime(0), l_OBJsqlRdr.GetDecimal(11)));
                        l_COLLnewValues.Add(l_OBJsqlRdr.GetName(13), new KeyValuePair<DateTime, decimal>(l_OBJsqlRdr.GetDateTime(0), l_OBJsqlRdr.GetDecimal(13)));
                        l_COLLnewValues.Add(l_OBJsqlRdr.GetName(15), new KeyValuePair<DateTime, decimal>(l_OBJsqlRdr.GetDateTime(0), l_OBJsqlRdr.GetDecimal(15)));
                        l_COLLnewValues.Add(l_OBJsqlRdr.GetName(17), new KeyValuePair<DateTime, decimal>(l_OBJsqlRdr.GetDateTime(0), l_OBJsqlRdr.GetDecimal(17)));
                    }

                    l_OBJsqlRdr.NextResult();

                    while (l_OBJsqlRdr.Read())
                    {
                        l_OBJmostRecentDate = l_OBJsqlRdr.GetDateTime(0);
                    }
                }
            }            

            foreach (string series in l_COLLseries)
            {
                using (HttpClient l_OBJclient = new HttpClient())
                {
                    HttpResponseMessage l_OBJresponse = l_OBJclient.GetAsync($"https://api.stlouisfed.org/fred/series/observations?series_id={series}&sort_order=asc&api_key={l_STRapiKey}&file_type=json").GetAwaiter().GetResult();

                    //Parse the returned JSON into custom classes
                    FREDOut l_OBJapiOutput = JsonConvert.DeserializeObject<FREDOut>(l_OBJresponse.Content.ReadAsStringAsync().GetAwaiter().GetResult());

                    //Parse the necessary information from the resultant objects
                    double l_DBLvalue = 0;
                    DateTime l_OBJdt = DateTime.Now;
                    l_COLLobservations = l_OBJapiOutput.observations.Where(row => { return (double.TryParse(row.value, out l_DBLvalue) && DateTime.TryParse(row.date, out l_OBJdt)); })
                        .Select(row =>
                        {
                            return new KeyValuePair<DateTime, double>(DateTime.Parse(row.date), double.Parse(row.value));
                        }).OrderBy(row => row.Key).ToHashSet();

                    if(l_COLLobservations.Last().Key >= l_OBJmostRecentDate)
                    {
                        l_COLLnewValues[series] = new KeyValuePair<DateTime, decimal>(l_COLLobservations.Last().Key, Convert.ToDecimal(l_COLLobservations.Last().Value));
                    }

                    else
                    {
                        l_COLLnewValues.Remove(series);
                    }                    
                }
            }

            return Ok(l_COLLnewValues.Select(kvp => new
            {
                Series = kvp.Key,
                Date = kvp.Value.Key,
                Value = kvp.Value.Value,
                OldDate = l_OBJmostRecentDate
            }));
        }

        [HttpGet("prediction")]
        public IActionResult GetPrediction(int v_INTforestID, int v_INTforestVersion, decimal v_DECbusLoans, decimal v_DECcPIAUCSL, decimal v_DECdPrime, decimal v_DECdPSACBW027SBOG, decimal v_DECeXPGS, decimal v_DECiMPGS, decimal v_DECrHEACBW027SBOG, decimal v_DECtLRESCONS, decimal v_DECuNRATE, decimal v_DECgDP)
        {
            Arborist l_OBJarboristRemade = ArboristFromDB(v_INTforestID, v_INTforestVersion);
            Dictionary<string, decimal> l_OBJoldValues = new Dictionary<string, decimal>();
            List<object> l_COLLpredictionValues = new List<object>();
            decimal l_DEClastGDP = 0m;

            using (SqlConnection l_OBJsqlConnection = new SqlConnection($"Server={l_STRservName};Database=WGUCapstone;Integrated Security=True;TrustServerCertificate=True"))
            {
                l_OBJsqlConnection.Open();
                SqlCommand l_OBJsqlCmd = l_OBJsqlConnection.CreateCommand();
                l_OBJsqlCmd.CommandType = CommandType.StoredProcedure;
                l_OBJsqlCmd.CommandText = "CapstoneUI.GetMostRecentSupLearn";

                using (SqlDataReader l_OBJsqlRdr = l_OBJsqlCmd.ExecuteReader())
                {
                    while (l_OBJsqlRdr.Read())
                    {
                        l_COLLpredictionValues.Add(1 - l_OBJsqlRdr.GetDecimal(1) / v_DECbusLoans * 100);
                        l_COLLpredictionValues.Add(1 - l_OBJsqlRdr.GetDecimal(2) / v_DECcPIAUCSL * 100);
                        l_COLLpredictionValues.Add(v_DECdPrime - l_OBJsqlRdr.GetDecimal(3));
                        l_COLLpredictionValues.Add(1 - l_OBJsqlRdr.GetDecimal(4) / v_DECdPSACBW027SBOG * 100);
                        l_COLLpredictionValues.Add(1 - l_OBJsqlRdr.GetDecimal(5) / v_DECeXPGS * 100);
                        l_COLLpredictionValues.Add(1 - l_OBJsqlRdr.GetDecimal(6) / v_DECiMPGS * 100);
                        l_COLLpredictionValues.Add(1 - l_OBJsqlRdr.GetDecimal(7) / v_DECrHEACBW027SBOG * 100);
                        l_COLLpredictionValues.Add(1 - l_OBJsqlRdr.GetDecimal(8) / v_DECtLRESCONS * 100);
                        l_COLLpredictionValues.Add(v_DECuNRATE - l_OBJsqlRdr.GetDecimal(9));
                        l_COLLpredictionValues.Add(1 - l_OBJsqlRdr.GetDecimal(10) / v_DECgDP * 100);
                        l_DEClastGDP = l_OBJsqlRdr.GetDecimal(10);
                    }
                }
            }

            object[] l_COLLresults = l_OBJarboristRemade.Predict(l_COLLpredictionValues);

            double l_DBLprediction = ((double)l_COLLresults[0] / 100) * Convert.ToDouble((decimal)(l_DEClastGDP)) + Convert.ToDouble((decimal)(l_DEClastGDP));
            double l_DBLhigh = ((double)l_COLLresults[1] / 100) * Convert.ToDouble((decimal)(l_DEClastGDP)) + Convert.ToDouble((decimal)(l_DEClastGDP));
            double l_DBLlow = ((double)l_COLLresults[2] / 100) * Convert.ToDouble((decimal)(l_DEClastGDP)) + Convert.ToDouble((decimal)(l_DEClastGDP));

            return Ok(new
            {
                Prediction = l_DBLprediction,
                High = l_DBLhigh,
                Low = l_DBLlow,
            });
        }

        private int ExpandAndSubmitTree(DecisionTree r_OBJtree, int v_INTrfID, int v_INTrfVer)
        {
            int l_INTreturnID = 0;
            DataTable l_OBJdataTable = new DataTable();
            l_OBJdataTable.Columns.Add("RandomForestID", typeof(int));
            l_OBJdataTable.Columns.Add("RandomForest_Version", typeof(int));
            l_OBJdataTable.Columns.Add("Depth", typeof (int));
            l_OBJdataTable.Columns.Add("MaxDepth", typeof(int));
            l_OBJdataTable.Columns.Add("MinSamplesToSplit", typeof(int));
            l_OBJdataTable.Columns.Add("isRoot", typeof(bool));
            l_OBJdataTable.Columns.Add("isLeaf", typeof(bool));
            l_OBJdataTable.Columns.Add("CAT_ClassValue", typeof(string));
            l_OBJdataTable.Columns.Add("NUM_ClassValue", typeof(decimal));
            l_OBJdataTable.Columns.Add("FeatureIndex", typeof(int));
            l_OBJdataTable.Columns.Add("Left_DecisionTreeID", typeof(int));
            l_OBJdataTable.Columns.Add("Right_DecisionTreeID", typeof(int));
            l_OBJdataTable.Columns.Add("CAT_Threshold", typeof(string));
            l_OBJdataTable.Columns.Add("NUM_Threshold", typeof(decimal));

            DataRow l_OBJnewRow = l_OBJdataTable.NewRow();
            l_OBJnewRow.SetField<int>("RandomForestID", v_INTrfID);
            l_OBJnewRow.SetField<int>("RandomForest_Version", v_INTrfVer);
            l_OBJnewRow.SetField<int>("Depth", r_OBJtree.Depth);
            l_OBJnewRow.SetField<int>("MaxDepth", r_OBJtree.MaxDepth);
            l_OBJnewRow.SetField<int>("MinSamplesToSplit", r_OBJtree.MinSamples);
            
            if (r_OBJtree.Depth == 0)
            {
                l_OBJnewRow.SetField<bool>("isRoot", true);
            }
            else
            {
                l_OBJnewRow.SetField<bool>("isRoot", false);
            }

            if (r_OBJtree.Root.LeftBranch is null && r_OBJtree.Root.RightBranch is null) 
            {
                l_OBJnewRow.SetField<bool>("isLeaf", true);
                if (r_OBJtree.Root.Numeric)
                {
                    l_OBJnewRow.SetField<decimal>("NUM_ClassValue", decimal.Parse(r_OBJtree.Root.NodeValue.ToString()));
                }
                else
                {
                    l_OBJnewRow.SetField<string>("CAT_ClassValue", r_OBJtree.Root.NodeValue.ToString());
                }
            }
            else
            {
                l_OBJnewRow.SetField<bool>("isLeaf", false);
                l_OBJnewRow.SetField<int>("Left_DecisionTreeID", ExpandAndSubmitTree(r_OBJtree.Root.LeftBranch, v_INTrfID, v_INTrfVer));
                l_OBJnewRow.SetField<int>("Right_DecisionTreeID", ExpandAndSubmitTree(r_OBJtree.Root.RightBranch, v_INTrfID, v_INTrfVer));
                if (r_OBJtree.Root.Numeric)
                {
                    l_OBJnewRow.SetField<decimal>("NUM_threshold", decimal.Parse(r_OBJtree.Root.Threshold.ToString()));
                }
                else
                {
                    l_OBJnewRow.SetField<string>("CAT_Threshold", r_OBJtree.Root.Threshold.ToString());
                }
                l_OBJnewRow.SetField<int>("FeatureIndex", r_OBJtree.Root.FeatureIndex);
            }

            l_OBJdataTable.Rows.Add(l_OBJnewRow);

            using (SqlConnection l_OBJsqlConn = new SqlConnection($"Server={l_STRservName};Database=WGUCapstone;Integrated Security=True;TrustServerCertificate=True"))
            {
                l_OBJsqlConn.Open();
                SqlCommand l_OBJsqlComm = l_OBJsqlConn.CreateCommand();
                l_OBJsqlComm.CommandType = CommandType.StoredProcedure;
                l_OBJsqlComm.Parameters.Add(new SqlParameter("@DecisionTrees", l_OBJdataTable));
                l_OBJsqlComm.CommandText = "CapstoneUI.insDecisionTrees";

                using(SqlDataReader l_OBJsqlRdr = l_OBJsqlComm.ExecuteReader())
                {
                    while (l_OBJsqlRdr.Read())
                    {
                        l_INTreturnID = Convert.ToInt32(l_OBJsqlRdr.GetDecimal(0));
                    }
                }
            }
            if(l_INTreturnID == 0)
            {
                throw new Exception("ID not generated");
            }
            return l_INTreturnID;
        }

        private Arborist ArboristFromDB(int v_INTforestID, int v_INTforestVersion)
        {
            IEnumerable<object> l_COLLdata = new List<object>();
            IEnumerable<object> l_COLLclassifications = new List<object>();
            IEnumerable<object> l_COLLclassificationAmounts = new List<object>();
            IEnumerable<object> l_COLLdataAmounts = new List<object>();
            IEnumerable<DateTime> l_COLLdates = new List<DateTime>();

            using (SqlConnection l_OBJsqlConn = new SqlConnection($"Server={l_STRservName};Database=WGUCapstone;Integrated Security=True;TrustServerCertificate=True"))
            {
                l_OBJsqlConn.Open();

                SqlCommand l_OBJsqlCmd = l_OBJsqlConn.CreateCommand();

                l_OBJsqlCmd.CommandText = "CapstoneUI.selGetTrainingData";
                l_OBJsqlCmd.CommandType = CommandType.StoredProcedure;
                l_OBJsqlCmd.Parameters.Add(new SqlParameter("@ForestID", v_INTforestID));
                l_OBJsqlCmd.Parameters.Add(new SqlParameter("@VersionID", v_INTforestVersion));

                BuildTrainingSets(l_OBJsqlCmd, ref l_COLLdata, ref l_COLLclassifications, ref l_COLLdates, ref l_COLLdataAmounts, ref l_COLLclassificationAmounts);

                l_OBJsqlConn.Close();
            }
            Arborist l_OBJreturnArborist = new Arborist(l_COLLdata, l_COLLclassifications, 1000, 100, 2);

            using (SqlConnection l_OBJsqlConn = new SqlConnection($"Server={l_STRservName};Database=WGUCapstone;Integrated Security=True;TrustServerCertificate=True"))
            {
                l_OBJsqlConn.Open();

                SqlCommand l_OBJsqlCmd = l_OBJsqlConn.CreateCommand();
                l_OBJsqlCmd.CommandText = "CapstoneUI.selGetTrees";
                l_OBJsqlCmd.CommandType = CommandType.StoredProcedure;
                l_OBJsqlCmd.Parameters.Add(new SqlParameter("@ForestID", v_INTforestID));
                l_OBJsqlCmd.Parameters.Add(new SqlParameter("@VersionID", v_INTforestVersion));
                
                DataTable l_OBJtrees = new DataTable();
                l_OBJtrees.Columns.Add(new DataColumn("DecisionTreeID", typeof(int)));
                l_OBJtrees.Columns.Add(new DataColumn("RandomForestID", typeof(int)));
                l_OBJtrees.Columns.Add(new DataColumn("RandomForestVersion", typeof(int)));
                l_OBJtrees.Columns.Add(new DataColumn("Depth", typeof(int)));
                l_OBJtrees.Columns.Add(new DataColumn("MaxDepth", typeof(int)));
                l_OBJtrees.Columns.Add(new DataColumn("MinSamplesToSplit", typeof(int)));
                l_OBJtrees.Columns.Add(new DataColumn("isRoot", typeof(bool)));
                l_OBJtrees.Columns.Add(new DataColumn("isLeaf", typeof(bool)));
                l_OBJtrees.Columns.Add(new DataColumn("CAT_ClassValue", typeof(string)));
                l_OBJtrees.Columns.Add(new DataColumn("NUM_ClassValue", typeof(decimal)));
                l_OBJtrees.Columns.Add(new DataColumn("FeatureIndex", typeof(int)));
                l_OBJtrees.Columns.Add(new DataColumn("Left_DecisionTreeID", typeof(int)));
                l_OBJtrees.Columns.Add(new DataColumn("Right_DecisionTreeID", typeof(int)));
                l_OBJtrees.Columns.Add(new DataColumn("CAT_Threshold", typeof(string)));
                l_OBJtrees.Columns.Add(new DataColumn("NUM_Threshold", typeof(decimal)));

                l_OBJtrees.PrimaryKey = [l_OBJtrees.Columns[0]];

                using (SqlDataReader l_OBJsqlRdr = l_OBJsqlCmd.ExecuteReader())
                {
                    
                    while (l_OBJsqlRdr.Read())
                    {
                        object[] l_COLLbuffer = new object[15];
                        l_OBJsqlRdr.GetValues(l_COLLbuffer);
                        DataRow l_OBJnewRow = l_OBJtrees.LoadDataRow(l_COLLbuffer, true);
                    }
                }

                foreach(DataRow l_OBJrootRow in l_OBJtrees.AsEnumerable().Where((row) => ( row.Field<bool>("isRoot") == true)))
                {
                    l_OBJreturnArborist.Forest.Add(ForestFromDataTable(l_OBJtrees, l_OBJrootRow.Field<int>("DecisionTreeID")));
                }
                return l_OBJreturnArborist;
            }
        }

        private DecisionTree ForestFromDataTable(DataTable r_OBJforest, int v_INTtreeID)
        {
            if (v_INTtreeID > 0)
            {
                DataRow l_OBJtreeRow = r_OBJforest.Rows.Find(v_INTtreeID);

                return new DecisionTree(l_OBJtreeRow.Field<int>("Depth"), l_OBJtreeRow.Field<int>("MaxDepth"), l_OBJtreeRow.Field<int>("MinSamplesToSplit"), new BranchNode(
                    l_OBJtreeRow.IsNull("NUM_ClassValue") & l_OBJtreeRow.IsNull("NUM_Threshold") ? false : true,
                    l_OBJtreeRow.IsNull("FeatureIndex") ? -1 : l_OBJtreeRow.Field<int>("FeatureIndex"),
                    l_OBJtreeRow.Field<bool>("isLeaf") ? null : (l_OBJtreeRow.IsNull("NUM_Threshold") ? l_OBJtreeRow.Field<object>("CAT_Threshold") : l_OBJtreeRow.Field<decimal>("NUM_Threshold")),
                    l_OBJtreeRow.Field<bool>("isLeaf") ? (l_OBJtreeRow.IsNull("NUM_ClassValue") ? l_OBJtreeRow.Field<object>("CAT_ClassValue") : l_OBJtreeRow.Field<decimal>("NUM_ClassValue")) : null,
                    l_OBJtreeRow.IsNull("Left_DecisionTreeID") ? null : ForestFromDataTable(r_OBJforest, l_OBJtreeRow.Field<int>("Left_DecisionTreeID")),
                    l_OBJtreeRow.IsNull("Right_DecisionTreeID") ? null : ForestFromDataTable(r_OBJforest, l_OBJtreeRow.Field<int>("Right_DecisionTreeID"))
                    ));
            }
            else
            {
                return null;
            }
        }

        private void BuildTrainingSets(SqlCommand l_OBJsqlCmd, ref IEnumerable<object> l_COLLdata, ref IEnumerable<object> l_COLLclassifications, ref IEnumerable<DateTime> l_COLLdates, ref IEnumerable<object> l_COLLdataAmounts, ref IEnumerable<object> l_COLLclassificationAmounts)
        {
            using (SqlDataReader l_OBJsqlReader = l_OBJsqlCmd.ExecuteReader())
            {
                while (l_OBJsqlReader.Read())
                {
                    l_COLLdata = l_COLLdata.Append(new object[]
                    {
                 l_OBJsqlReader.GetDecimal(l_OBJsqlReader.GetOrdinal("T2_BUSLOANSPercentChange"))
                ,l_OBJsqlReader.GetDecimal(l_OBJsqlReader.GetOrdinal("T2_CPIAUCSLPercentChange"))
                ,l_OBJsqlReader.GetDecimal(l_OBJsqlReader.GetOrdinal("T2_DPRIMEPercentChange"))
                ,l_OBJsqlReader.GetDecimal(l_OBJsqlReader.GetOrdinal("T2_DPSACBW027SBOGPercentChange"))
                ,l_OBJsqlReader.GetDecimal(l_OBJsqlReader.GetOrdinal("T2_EXPGSPercentChange"))
                ,l_OBJsqlReader.GetDecimal(l_OBJsqlReader.GetOrdinal("T2_IMPGSPercentChange"))
                ,l_OBJsqlReader.GetDecimal(l_OBJsqlReader.GetOrdinal("T2_RHEACBW027SBOGPercentChange"))
                ,l_OBJsqlReader.GetDecimal(l_OBJsqlReader.GetOrdinal("T2_TLRESCONPercentChange"))
                ,l_OBJsqlReader.GetDecimal(l_OBJsqlReader.GetOrdinal("T2_UNRATEPercentChange"))
                ,l_OBJsqlReader.GetDecimal(l_OBJsqlReader.GetOrdinal("T2_GDPPercentChange"))
                    });

                    l_COLLclassifications = l_COLLclassifications.Append(l_OBJsqlReader.GetDecimal(l_OBJsqlReader.GetOrdinal("T3_GDPPercentChange")));

                    l_COLLdates = l_COLLdates.Append(l_OBJsqlReader.GetDateTime(l_OBJsqlReader.GetOrdinal("T2_Date")));

                    l_COLLdataAmounts = l_COLLdataAmounts.Append(new object[]
                    {
                 l_OBJsqlReader.GetDecimal(l_OBJsqlReader.GetOrdinal("T2_BUSLOANSBillions"))
                ,l_OBJsqlReader.GetDecimal(l_OBJsqlReader.GetOrdinal("T2_CPIAUCSL"))
                ,l_OBJsqlReader.GetDecimal(l_OBJsqlReader.GetOrdinal("T2_DPRIMEPercent"))
                ,l_OBJsqlReader.GetDecimal(l_OBJsqlReader.GetOrdinal("T2_DPSACBW027SBOGBillions"))
                ,l_OBJsqlReader.GetDecimal(l_OBJsqlReader.GetOrdinal("T2_EXPGSBillions"))
                ,l_OBJsqlReader.GetDecimal(l_OBJsqlReader.GetOrdinal("T2_IMPGSBillions"))
                ,l_OBJsqlReader.GetDecimal(l_OBJsqlReader.GetOrdinal("T2_RHEACBW027SBOGBillions"))
                ,l_OBJsqlReader.GetDecimal(l_OBJsqlReader.GetOrdinal("T2_TLRESCONBillions"))
                ,l_OBJsqlReader.GetDecimal(l_OBJsqlReader.GetOrdinal("T2_UNRATEPercent"))
                ,l_OBJsqlReader.GetDecimal(l_OBJsqlReader.GetOrdinal("T2_GDPBillions"))
                    });

                    l_COLLclassificationAmounts = l_COLLclassificationAmounts.Append(l_OBJsqlReader.GetDecimal(l_OBJsqlReader.GetOrdinal("T3_GDPBillions")));
                }
            }
           
        }
    }
}
