using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using RandomForest;
using System.Data;
using WGUCapstoneUI.Server.Classes;
using Newtonsoft.Json;
using Microsoft.Data.SqlClient;

namespace WGUCapstoneUI.Server.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class MLController : ControllerBase
    {
        string l_STRapiKey = "10048f9b5d22064ad5b617fafce15bb4";
        List<string> l_COLLquarterlySeries = new List<string> { "EXPGS", "GDP", "IMPGS", };

        [HttpGet("raw")]
        public IActionResult GetRawData(string l_STRseries)
        {
            DataTable l_OBJtable = new DataTable();
            l_OBJtable.Columns.Add("date", Type.GetType("System.DateTime, mscorlib, Version=4.0.0.0, Culture=neutral, PublicKeyToken=b77a5c561934e089"));
            l_OBJtable.Columns.Add("value", Type.GetType("System.Double"));

            HashSet<KeyValuePair<DateTime, double>> l_COLLobservations = new HashSet<KeyValuePair<DateTime, double>>();

            using (HttpClient l_OBJclient = new HttpClient())
            {
                HttpResponseMessage l_OBJresponse = l_OBJclient.GetAsync($"https://api.stlouisfed.org/fred/series/observations?series_id={l_STRseries}&sort_order=asc&api_key={l_STRapiKey}&file_type=json").GetAwaiter().GetResult();

                FREDOut l_OBJapiOutput = JsonConvert.DeserializeObject<FREDOut>(l_OBJresponse.Content.ReadAsStringAsync().GetAwaiter().GetResult());

                double l_DBLvalue = 0;
                DateTime l_OBJdt = DateTime.Now;
                l_COLLobservations = l_OBJapiOutput.observations.Where(row => { return (double.TryParse(row.value, out l_DBLvalue) && DateTime.TryParse(row.date, out l_OBJdt)); })
                    .Select(row =>
                    {
                        return new KeyValuePair<DateTime, double>(DateTime.Parse(row.date), double.Parse(row.value));
                    }).ToHashSet();

                foreach (KeyValuePair<DateTime, double> kvp in l_COLLobservations)
                {
                    l_OBJtable.Rows.Add(new object[] { kvp.Key, kvp.Value });
                }
            }

            using (SqlConnection l_OBJsqlConn = new SqlConnection("Server=localhost; Database=WGUCapstone; Integrated Security=True;Trust Server Certificate=True"))
            {
                l_OBJsqlConn.Open();

                SqlCommand l_OBJsqlComm = new SqlCommand($"ins{l_STRseries}", l_OBJsqlConn);
                l_OBJsqlComm.Parameters.Add(new SqlParameter("@apiRecord", l_OBJtable));
                l_OBJsqlComm.CommandType = CommandType.StoredProcedure;
                int l_INTrowsOut = l_OBJsqlComm.ExecuteNonQuery();
            }

            return Ok(l_COLLobservations.ToList());
        }

        [HttpGet("adjusted")]
        public IActionResult TimeAdjustData(string l_STRseries)
        {
            DataTable l_OBJreturnTable = new DataTable();
            l_OBJreturnTable.Columns.Add(new DataColumn("Date", Type.GetType("System.DateTime")));
            l_OBJreturnTable.Columns.Add(new DataColumn("Value", Type.GetType("System.Decimal")));

            using (SqlConnection l_OBJsqlConn = new SqlConnection())
            {
                l_OBJsqlConn.Open();

                SqlCommand l_OBJsqlComm = l_OBJsqlConn.CreateCommand();

                l_OBJsqlComm.CommandText = $"ins{l_STRseries}Adjusted";

                l_OBJsqlComm.CommandType = CommandType.StoredProcedure;

                using (SqlDataReader l_OBJsqlDataRdr = l_OBJsqlComm.ExecuteReader())
                {
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

            return Ok(l_OBJreturnTable.AsEnumerable().Select(row => new
            {
                 Date = row["Date"]
                ,Value = row["Value"]
            }).ToList());
        }
    }
}
