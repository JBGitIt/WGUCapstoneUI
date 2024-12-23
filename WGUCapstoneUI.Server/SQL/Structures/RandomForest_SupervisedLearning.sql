USE [WGUCapstone]
GO

/****** Object:  Table [CapstoneUI].[RandomForest_SupervisedLearning]    Script Date: 12/22/2024 8:50:31 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [CapstoneUI].[RandomForest_SupervisedLearning](
	[RandomForestID] [int] NULL,
	[RandomForest_Version] [int] NULL,
	[SupervisedLearning_T2_Date] [date] NULL,
	[isOriginalTraining] [bit] NULL,
	[isValidationCorrect] [bit] NULL
) ON [PRIMARY]
GO

ALTER TABLE [CapstoneUI].[RandomForest_SupervisedLearning]  WITH CHECK ADD  CONSTRAINT [FK__RandomForest_Sup__0F2D40CE] FOREIGN KEY([RandomForestID], [RandomForest_Version])
REFERENCES [CapstoneUI].[RandomForest] ([RandomForestID], [Version])
ON UPDATE CASCADE
ON DELETE CASCADE
GO

ALTER TABLE [CapstoneUI].[RandomForest_SupervisedLearning] CHECK CONSTRAINT [FK__RandomForest_Sup__0F2D40CE]
GO


