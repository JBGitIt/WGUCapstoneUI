USE [WGUCapstone]
GO

/****** Object:  StoredProcedure [CapstoneUI].[insUNRATEAdjusted]    Script Date: 12/22/2024 8:36:47 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO


--Adjust dates on original data so that we have common dates throughout our dataset. 
--Insert adjusted data into a new table.
CREATE PROCEDURE [CapstoneUI].[insUNRATEAdjusted]
AS
BEGIN


DROP TABLE IF EXISTS WGUCapstone.CapstoneUI.UNRATEAdjusted;
CREATE TABLE WGUCapstone.CapstoneUI.UNRATEAdjusted
(
	 AsOfDate DATE
	,UNRATEPercent MONEY
	,IsAdjusted BIT --Bit value to represent whether or not this data is for the date listed or if it was moved forward.
);

--Get the length of time between each date and the dates from the MasterDate table
WITH DateOps (DaysDistant, UNRATEDate, MasterDate)
AS
(
	SELECT DATEDIFF(DAY, a.AsOfDate, b.AsOfDate) AS DaysDistant
		  ,a.AsOfDate AS UNRATEDate
		  ,b.AsOfDate AS MasterDate
	  FROM WGUCapstone.CapstoneUI.UNRATE a
	  JOIN WGUCapstone.CapstoneUI.AsOfDateMASTER b
        ON ABS(DATEDIFF(DAY, a.AsOfDate, b.AsOfDate)) < 180
),

--Organize data by it's distance to the dates in MasterDate and give it a row number based on it's relationship to that date.
RowDate (MasterDate, UNRATEPercent, UNRATEDate, isAdjusted, RowNum)
AS
(
		SELECT  b.MasterDate
			   ,a.UNRATEPercent
			   ,a.AsOfDate
			   ,CASE
			       WHEN a.AsOfDate = b.MasterDate
				   THEN 0
				   ELSE 1
			    END
			   ,ROW_NUMBER() OVER(PARTITION BY b.MasterDate ORDER BY a.AsOfDate ASC)
		  FROM WGUCapstone.CapstoneUI.UNRATE a
		  JOIN DateOps b
			ON a.AsOfDate = b.UNRATEDate
		   AND b.DaysDistant = (SELECT MIN(c.DaysDistant)
								  FROM DateOps c
								 WHERE c.MasterDate = b.MasterDate
								   AND c.DaysDistant >= 0
							  GROUP BY c.MasterDate)

)


--Insert into our new table the number 1 record from each partition over MasterDate
INSERT INTO WGUCapstone.CapstoneUI.UNRATEAdjusted
	 SELECT  MasterDate
            ,UNRATEPercent
			,isAdjusted
       FROM RowDate
      WHERE RowNum = 1
   ORDER BY MasterDate

--Return the adjusted dataset for review
SELECT  a.AsOfDate
	   ,a.UNRATEPercent
  FROM WGUCapstone.CapstoneUI.UNRATEAdjusted a
END
GO


