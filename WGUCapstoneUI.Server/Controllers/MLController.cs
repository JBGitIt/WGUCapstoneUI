using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using RandomForest;
using System.Data;

namespace WGUCapstoneUI.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MLController : ControllerBase
    {
        public string GetRawData()
        {
            using (HttpClient l_OBJclient = new HttpClient())
            {
                HttpResponseMessage l_OBJresponse = l_OBJclient.GetAsync($"https://api.stlouisfed.org/fred/series/observations?series_id={l_STRseries}&sort_order=asc&api_key={l_STRapiKey}&file_type=json").GetAwaiter().GetResult();

                if (l_BOOLverbose)
                {
                    Console.WriteLine($"\nFRED HTTP Response code: {l_OBJresponse.StatusCode}");
                    if (l_OBJresponse.StatusCode == System.Net.HttpStatusCode.OK)
                    {
                        Console.WriteLine($"\nAttempting to parse results...");
                    }
                }

                FREDOut l_OBJapiOutput = JsonConvert.DeserializeObject<FREDOut>(l_OBJresponse.Content.ReadAsStringAsync().GetAwaiter().GetResult());

                if (l_BOOLverbose)
                {
                    Console.WriteLine($"\nTotal observations returned and parsed: {l_OBJapiOutput.observations.Count}");

                    if (l_OBJapiOutput.observations.Count > 0)
                    {
                        Console.WriteLine($"\nAttempting to build table...");
                    }
                }

                double l_DBLvalue = 0;
                DateTime l_OBJdt = DateTime.Now;
                HashSet<KeyValuePair<DateTime, double>> l_COLLobservations = l_OBJapiOutput.observations.Where(row => { return (double.TryParse(row.value, out l_DBLvalue) && DateTime.TryParse(row.date, out l_OBJdt)); })
                    .Select(row =>
                    {
                        return new KeyValuePair<DateTime, double>(DateTime.Parse(row.date), double.Parse(row.value));
                    }).ToHashSet();

                foreach (KeyValuePair<DateTime, double> kvp in l_COLLobservations)
                {
                    l_OBJtable.Rows.Add(new object[] { kvp.Key, kvp.Value });
                }
            }

            if (l_BOOLverbose)
            {
                Console.WriteLine("\nAttempting to Connect to SQL");
            }

            using (SqlConnection l_OBJsqlConn = new SqlConnection("Server=localhost; Database=WGUCapstone; Integrated Security=True;"))
            {
                l_OBJsqlConn.Open();

                if (l_BOOLverbose)
                {
                    Console.WriteLine($"\n Writing to table: WGUCapstone.dbo.{l_STRseries}");
                }

                SqlCommand l_OBJsqlComm = new SqlCommand($"ins{l_STRseries}", l_OBJsqlConn);
                l_OBJsqlComm.Parameters.Add(new SqlParameter("@apiRecord", l_OBJtable));
                l_OBJsqlComm.CommandType = CommandType.StoredProcedure;
                int l_INTrowsOut = l_OBJsqlComm.ExecuteNonQuery();

                if (l_BOOLverbose)
                {
                    Console.WriteLine($"\n{l_INTrowsOut} rows written");
                }
            }
        }
    }
}
