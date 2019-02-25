BEGIN
 DECLARE x  INT;
 DECLARE y  INT;
 DECLARE pcount  INT;
 DECLARE row  INT;
 DECLARE FC INT;
 DECLARE TCstr  VARCHAR(300);
 DECLARE ED Date;
 DECLARE ED1 Date; 
 DECLARE ED2 Date; 
 
 SET x = 1;
 SET y = 1;
 SET FC = 0;

 SET ED = EDx;
 
 SET TCstr =TC;
 


 
myloop: WHILE x  <= 25 DO
 
 SET pcount = (select COUNT(STATUS) from pssauto as FC1 where Testcase =TCstr and STATUS ='FAIL' and  executiondate =ED);
 
 select pcount;
 
 IF pcount >0 THEN


 SET FC = FC+ (select COUNT(STATUS) from pssauto as FC1 where Testcase =TCstr and STATUS ='FAIL' and  executiondate =ED) ; 
 


Set ED1 = ED;
Set ED2=DATE_SUB(ED1, INTERVAL 1 day);
Set ED=ED2;
SET x = x + 1;


 SELECT ED;

ELSE

LEAVE myloop;




END IF;

 END WHILE myloop;
 
 SELECT FC;
 END