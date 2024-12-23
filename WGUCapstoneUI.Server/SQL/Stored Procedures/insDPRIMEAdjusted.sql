USE [WGUCapstone]
GO

/****** Object:  StoredProcedure [CapstoneUI].[insDPRIMEAdjusted]    Script Date: 12/22/2024 8:35:31 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO


--Adjust dates on original data so that we have common dates throughout our dataset. 
--Insert adjusted data into a new table.
CREATE PROCEDURE [CapstoneUI].[insDPRIMEAdjusted]
AS
BEGIN


DROP TABLE IF EXISTS WGUCapstone.CapstoneUI.DPRIMEAdjusted;
CREATE TABLE WGUCapstone.CapstoneUI.DPRIMEAdjusted
(
	 AsOfDate DATE
	,DPRIMEPercent MONEY
	,IsAdjusted BIT --Bit value to represent whether or not this data is for the date listed or if it was moved forward.
);

--Get the length of time between each date and the dates from the MasterDate table
WITH DateOps (DaysDistant, DPRIMEDate, MasterDate)
AS
(
	SELECT DATEDIFF(DAY, a.AsOfDate, b.AsOfDate) AS DaysDistant
		  ,a.AsOfDate AS DPRIMEDate
		  ,b.AsOfDate AS MasterDate
	  FROM WGUCapstone.CapstoneUI.DPRIME a
	  JOIN WGUCapstone.CapstoneUI.AsOfDateMASTER b
        ON ABS(DATEDIFF(DAY, a.AsOfDate, b.AsOfDate)) < 180
),

--Organize data by it's distance to the dates in MasterDate and give it a row number based on it's relationship to that date.
RowDate (MasterDate, DPRIMEPercent, DPRIMEDate, isAdjusted, RowNum)
AS
(
		SELECT  b.MasterDate
			   ,a.DPRIMEPercent
			   ,a.AsOfDate
			   ,CASE
			       WHEN a.AsOfDate = b.MasterDate
				   THEN 0
				   ELSE 1
			    END
			   ,ROW_NUMBER() OVER(PARTITION BY b.MasterDate ORDER BY a.AsOfDate ASC)
		  FROM WGUCapstone.CapstoneUI.DPRIME a
		  JOIN DateOps b
			ON a.AsOfDate = b.DPRIMEDate
		   AND b.DaysDistant = (SELECT MIN(c.DaysDistant)
								  FROM DateOps c
								 WHERE c.MasterDate = b.MasterDate
								   AND c.DaysDistant >= 0
							  GROUP BY c.MasterDate)

)


--Insert into our new table the number 1 record from each partition over MasterDate
INSERT INTO WGUCapstone.CapstoneUI.DPRIMEAdjusted
	 SELECT  MasterDate
            ,DPRIMEPercent
			,isAdjusted
       FROM RowDate
      WHERE RowNum = 1
   ORDER BY MasterDate

--Return the adjusted dataset for review
SELECT  a.AsOfDate
	   ,a.DPRIMEPercent
  FROM WGUCapstone.CapstoneUI.DPRIMEAdjusted a
END
GO


