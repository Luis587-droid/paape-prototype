// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// Import the auto-generated ZKP Verifier from the build folder
import "./verifier.sol";

contract AccessPolicy {
    Groth16Verifier public zkVerifier;
    
    // The policy rule: Users must prove they are at least this old
    uint256 public requiredAgeLimit;
    
    // Store successful authentications (user pseudonym => is auth)
    mapping(bytes32 => bool) public authenticatedUsers;

    event AccessGranted(bytes32 indexed pseudonym);

    // Deploys the contract to the blockchain setting its param

    constructor(address _verifierContractAddress, uint256 _ageLimit) {
        zkVerifier = Groth16Verifier(_verifierContractAddress);
        requiredAgeLimit = _ageLimit;
    }

    // The function the Policy Engine calls to submit the user's proof (Zero Knowledge ID)
    function requestAccess(
        bytes32 userPseudonym,
        uint[2] calldata a,
        uint[2][2] calldata b,
        uint[2] calldata c,
        uint[2] calldata input // input[0] is policySatisfied (must be 1), input[1] is ageLimit
    ) public {
        
        // 1. Check that the proof is for the correct policy limit (Possible Replay Attack)
        require(input[1] == requiredAgeLimit, "Proof is not for the correct age limit");

        // 2. Check that the circuit output evaluated to true (1)
        require(input[0] == 1, "Policy not satisfied");

        // 3. Verify the Zero-Knowledge Proof using the generated contract (Agains manual forgery of "input")
        bool isValid = zkVerifier.verifyProof(a, b, c, input);
        require(isValid, "ZKP Verification Failed: Invalid Proof");

        // 4. Grant access without knowing the user's real age
        authenticatedUsers[userPseudonym] = true;
        emit AccessGranted(userPseudonym);
    }
}
