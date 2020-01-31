Feature: Verify MES portal 
 
  I want to open MES portal and verify Weekly page
  
  @Regression
  Scenario: Opening MES Portal
    Given I open MES Portal
    When I Click on Weekly
    Then I see "Events"