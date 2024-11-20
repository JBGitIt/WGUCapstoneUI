namespace WGUCapstoneUI.Server.Classes
{
    class FREDOut
    {
        public string realtime_start;
        public string realtime_end;
        public string observation_start;
        public string observation_end;
        public string units;
        public string output_type;
        public string file_type;
        public string order_by;
        public string sort_order;
        public int count;
        public int offset;
        public int limit;
        public List<FREDobs> observations;
    }
}
