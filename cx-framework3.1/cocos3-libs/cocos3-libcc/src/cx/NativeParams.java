package cx;

public class NativeParams
{
	public class NativeParam
	{
		private String param;
		
		public NativeParam(String param)
		{
			this.param = param;
		}
		
		public String asString()
		{
			return param;
		}
		
		public int asInt()
		{
			return Integer.parseInt(param);
		}
		
		public float asFloat()
		{
			return Float.parseFloat(param);
		}
		
		public boolean asBool()
		{
			return Boolean.parseBoolean(param);
		}
	}
	
	public String classname;
	public String fname;
	private String[] params;
	public NativeParams(String classname, String fname, String[] params)
	{
		this.classname = classname;
		this.fname = fname;
		this.params = params;
	}
	
	public NativeParam at(int index)
	{
		return new NativeParam(params[index]);
	}
	
	@Override
	public String toString()
	{
		String s = "";
		for (int i=0; i<params.length; i++)
			s += "," + params[i];
		return s.isEmpty() ? s : s.substring(1);
	}
}
