-- Set up nomination and stockpile

SET QUOTED_IDENTIFIER OFF
SET ANSI_NULLS ON

use LSTIOPSDbSeedAutomation


exec DeleteAll


declare @comm datetime = dateadd(DD, -1, sysdatetime())
declare @laycanEnd datetime = dateadd(DD, 1, sysdatetime())
exec CreateNominationOnBerth 111111, '999999', 'TBN TIM', @comm, 'A'
exec CreateNominationItem 111111, 1, 'MACF', 100000, @comm, @comm, @laycanEnd
exec CreateStockpile 'A3', 100000, 80000, 'MACF', 'Complete', 100, 500, 'NY'



declare @start datetime = dateadd(HOUR, -1, sysdatetime())
exec CreateOperationalReclaimLoad 111111, 'A3', 'MACF', 6000, @start, null, 'BWR5', 'SL2', '53', 'A'
