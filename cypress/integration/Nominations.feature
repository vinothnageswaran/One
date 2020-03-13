Feature: Verify Nomination Source for a given vessel
 
  

    Background:
    Scenario: Verify Nomination Source for a given vessel
   
    Given User navigates to DM Dashboard
    Then I click on vessel
    
    Scenario: Check the vessel number is 1
    Then I see Vessel details as "1"
    
    Scenario: Verify Product is MACF
    Then I see Product as "MACF"
    
    Scenario: Verify Tonnes is 100000
    Then I see "100000" Tonnes
    
    Scenario: Verify Left to Load is 100000
    Then I see "100000" Left to Load
    
    Scenario: Verify Reclaim from stockpile "A3" and the product is MACF
    Then Reclaim from stockpile "A3" is MACF

    Scenario: Verify  Add Dual Load should be available
    Then the button Add Dual Load

    Scenario: Verify Add Source should be available
    Then the button Add Source should be available

    Scenario: Verify manual override exist
    Then The manual override button exist

    Scenario: Verify remove source exist
    Then The remove source exist