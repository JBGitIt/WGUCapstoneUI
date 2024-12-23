namespace WGUCapstoneUI.Server.Classes
{
    public class ForestFromDB
    {
        public int p_INTversion;
        public DateTime p_OBJversionDate;
        public decimal p_DECvalidationAccuracy;

        public ForestFromDB(int v_INTversion, DateTime r_OBJversionDate, decimal v_DECvalidationAccuracy)
        {
            p_INTversion = v_INTversion;
            p_OBJversionDate = r_OBJversionDate;
            p_DECvalidationAccuracy = v_DECvalidationAccuracy;
        }
    }
}
