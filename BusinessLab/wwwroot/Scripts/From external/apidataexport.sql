USE [ATECApi]
GO
/****** Object:  Table [dbo].[Actions]    Script Date: 11/22/2023 2:30:33 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Actions](
	[ActionID] [int] IDENTITY(1,1) NOT NULL,
	[ActionName] [nvarchar](max) NOT NULL,
	[ActionDescription] [nvarchar](max) NULL,
	[EditorType] [nvarchar](max) NULL,
	[Code] [nvarchar](max) NULL,
	[Sql] [nvarchar](max) NULL,
	[VariableDelimiter] [nvarchar](max) NULL,
	[UniqueID] [nvarchar](max) NULL,
	[FailActionDescription] [nvarchar](max) NULL,
	[SuccessActionDescription] [nvarchar](max) NULL,
	[RepeatQuantity] [int] NULL,
	[CronSchedule] [nvarchar](50) NULL,
	[RepeatIntervalSeconds] [int] NULL,
	[DataSourceID] [int] NULL
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Apps]    Script Date: 11/22/2023 2:30:33 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Apps](
	[AppID] [int] IDENTITY(1,1) NOT NULL,
	[AppName] [nvarchar](50) NULL,
	[AppDescription] [nvarchar](max) NULL,
	[AreaID] [int] NOT NULL,
	[LogAppThumbnailURL] [nvarchar](100) NULL,
	[Active] [bit] NOT NULL,
	[Result] [nvarchar](max) NULL,
 CONSTRAINT [PK_Apps] PRIMARY KEY CLUSTERED 
(
	[AppID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Apps_Steps]    Script Date: 11/22/2023 2:30:33 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Apps_Steps](
	[AppID] [int] NOT NULL,
	[StepID] [int] NOT NULL
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Areas]    Script Date: 11/22/2023 2:30:33 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Areas](
	[AreaID] [int] IDENTITY(1,1) NOT NULL,
	[AreaName] [nvarchar](50) NULL
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[DataSources]    Script Date: 11/22/2023 2:30:33 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[DataSources](
	[DataSourceID] [int] IDENTITY(1,1) NOT NULL,
	[DataSourceName] [nvarchar](50) NOT NULL,
 CONSTRAINT [PK_DataSources] PRIMARY KEY CLUSTERED 
(
	[DataSourceID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Logs]    Script Date: 11/22/2023 2:30:33 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Logs](
	[LogID] [int] IDENTITY(1,1) NOT NULL,
	[LogSeverity] [int] NOT NULL,
	[StepID] [int] NOT NULL,
	[UniqueID] [nvarchar](100) NULL,
	[Title] [nvarchar](200) NULL,
	[Description] [nvarchar](max) NULL,
	[Created] [datetime2](7) NOT NULL,
	[AppID] [int] NULL,
	[UserFullName] [nvarchar](100) NULL,
 CONSTRAINT [PK_Logs] PRIMARY KEY CLUSTERED 
(
	[LogID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Projects]    Script Date: 11/22/2023 2:30:33 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Projects](
	[ProjectID] [int] IDENTITY(1,1) NOT NULL,
	[ProjectName] [nvarchar](50) NOT NULL,
	[ProjectDescription] [nvarchar](max) NULL,
 CONSTRAINT [PK_Projects] PRIMARY KEY CLUSTERED 
(
	[ProjectID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Projects_Steps]    Script Date: 11/22/2023 2:30:33 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Projects_Steps](
	[ProjectID] [int] NOT NULL,
	[StepID] [int] NOT NULL
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Projects_Tasks]    Script Date: 11/22/2023 2:30:33 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Projects_Tasks](
	[ProjectID] [int] NOT NULL,
	[TaskID] [int] NOT NULL,
 CONSTRAINT [PK_Projects_Tasks] PRIMARY KEY CLUSTERED 
(
	[ProjectID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Steps]    Script Date: 11/22/2023 2:30:33 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Steps](
	[StepID] [int] IDENTITY(1,1) NOT NULL,
	[WorkflowID] [int] NOT NULL,
	[StepName] [nvarchar](50) NULL,
	[StepDescription] [nvarchar](max) NULL,
	[StepOrder] [decimal](18, 1) NULL
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Steps_Tasks]    Script Date: 11/22/2023 2:30:33 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Steps_Tasks](
	[StepID] [int] NOT NULL,
	[TaskID] [int] NULL
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[TaskComments]    Script Date: 11/22/2023 2:30:33 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[TaskComments](
	[TaskCommentID] [int] IDENTITY(1,1) NOT NULL,
	[TaskID] [int] NOT NULL,
	[TaskCommentFromID] [int] NOT NULL,
	[TaskCommentToID] [int] NULL,
	[TaskCommentTitle] [nvarchar](max) NOT NULL,
	[TaskCommentContent] [nvarchar](max) NULL,
	[Created] [datetime2](7) NOT NULL,
	[Updated] [datetime] NOT NULL
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[TaskDependencyTypes]    Script Date: 11/22/2023 2:30:33 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[TaskDependencyTypes](
	[TaskDependencyTypeID] [int] IDENTITY(1,1) NOT NULL,
	[TaskDependencyTypeName] [nvarchar](50) NOT NULL,
 CONSTRAINT [PK_TaskDependencyTypes] PRIMARY KEY CLUSTERED 
(
	[TaskDependencyTypeID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Tasks]    Script Date: 11/22/2023 2:30:33 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Tasks](
	[TaskID] [int] IDENTITY(1,1) NOT NULL,
	[TaskName] [nvarchar](50) NOT NULL,
	[TaskDescription] [nvarchar](max) NULL,
	[AssignedToID] [int] NOT NULL,
	[PercentComplete] [int] NOT NULL,
	[MinutesPlanned] [int] NOT NULL,
	[MinutesActual] [int] NOT NULL,
	[InProgressID] [int] NOT NULL,
	[EstimatedCodeComplete] [datetime2](7) NULL,
	[ActualCodeComplete] [datetime2](7) NULL,
	[EstimatedTestingComplete] [datetime2](7) NULL,
	[ActualTestingComplete] [datetime2](7) NULL,
	[StakeHolderApproved] [datetime2](7) NULL,
	[StakeHolderApprovedID] [int] NOT NULL,
 CONSTRAINT [PK_Tasks] PRIMARY KEY CLUSTERED 
(
	[TaskID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Tasks_Dependencies]    Script Date: 11/22/2023 2:30:33 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Tasks_Dependencies](
	[Tasks_DependenciesID] [int] IDENTITY(1,1) NOT NULL,
	[TaskID] [int] NOT NULL,
	[TaskDependencyID] [int] NOT NULL,
 CONSTRAINT [PK_Tasks_Dependencies] PRIMARY KEY CLUSTERED 
(
	[Tasks_DependenciesID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Tokens]    Script Date: 11/22/2023 2:30:33 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Tokens](
	[CustomerUserID] [int] NOT NULL,
	[Token] [uniqueidentifier] NOT NULL,
	[Created] [datetime2](7) NOT NULL,
	[CustomerName] [nvarchar](100) NULL,
 CONSTRAINT [PK_Tokens] PRIMARY KEY CLUSTERED 
(
	[CustomerUserID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Users]    Script Date: 11/22/2023 2:30:33 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Users](
	[UserID] [int] IDENTITY(1,1) NOT NULL,
	[CMSUserID] [int] NOT NULL,
	[FirstName] [nvarchar](50) NOT NULL,
	[LastName] [nvarchar](50) NOT NULL,
	[Email] [nvarchar](50) NOT NULL,
	[PasswordlessToken] [nvarchar](50) NULL,
	[Passcode] [int] NULL,
	[TokenUpdated] [datetime2](7) NULL,
 CONSTRAINT [PK_Users] PRIMARY KEY CLUSTERED 
(
	[UserID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[UserSettings]    Script Date: 11/22/2023 2:30:33 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[UserSettings](
	[UserSettingID] [int] IDENTITY(1,1) NOT NULL,
	[SettingName] [nvarchar](50) NOT NULL,
	[SettingValue] [nvarchar](max) NOT NULL,
	[UserID] [int] NOT NULL,
 CONSTRAINT [PK_UserSettings] PRIMARY KEY CLUSTERED 
(
	[UserSettingID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Workflows]    Script Date: 11/22/2023 2:30:33 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Workflows](
	[WorkflowID] [int] IDENTITY(1,1) NOT NULL,
	[AreaID] [int] NOT NULL,
	[WorkflowName] [nvarchar](50) NULL,
	[WorkflowDescription] [nvarchar](max) NULL
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
ALTER TABLE [dbo].[Apps] ADD  CONSTRAINT [DF_Apps_Active]  DEFAULT ((1)) FOR [Active]
GO
ALTER TABLE [dbo].[Logs] ADD  CONSTRAINT [DF_Logs_Created]  DEFAULT (getdate()) FOR [Created]
GO
ALTER TABLE [dbo].[TaskComments] ADD  CONSTRAINT [DF_TaskComments_Created]  DEFAULT (getdate()) FOR [Created]
GO
ALTER TABLE [dbo].[TaskComments] ADD  CONSTRAINT [DF_TaskComments_Updated]  DEFAULT (getdate()) FOR [Updated]
GO
ALTER TABLE [dbo].[Tasks] ADD  CONSTRAINT [DF_Tasks_AssignedToID]  DEFAULT ((0)) FOR [AssignedToID]
GO
ALTER TABLE [dbo].[Tasks] ADD  CONSTRAINT [DF_Tasks_PercentComplete]  DEFAULT ((0)) FOR [PercentComplete]
GO
ALTER TABLE [dbo].[Tasks] ADD  CONSTRAINT [DF_Tasks_MinutesPlanned]  DEFAULT ((0)) FOR [MinutesPlanned]
GO
ALTER TABLE [dbo].[Tasks] ADD  CONSTRAINT [DF_Tasks_MinutesActual]  DEFAULT ((0)) FOR [MinutesActual]
GO
ALTER TABLE [dbo].[Tasks] ADD  CONSTRAINT [DF_Tasks_InProgressID]  DEFAULT ((0)) FOR [InProgressID]
GO
ALTER TABLE [dbo].[Tasks] ADD  CONSTRAINT [DF_Tasks_StakeHolderApprovedID]  DEFAULT ((0)) FOR [StakeHolderApprovedID]
GO
ALTER TABLE [dbo].[Tokens] ADD  CONSTRAINT [DF_Tokens_Created]  DEFAULT (getdate()) FOR [Created]
GO
