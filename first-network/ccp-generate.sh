#!/bin/bash

function one_line_pem {
    echo "`awk 'NF {sub(/\\n/, ""); printf "%s\\\\\\\n",$0;}' $1`"
}

function json_ccp {
       local PP1=$(one_line_pem $1)
    local CP1=$(one_line_pem $2)
     local PP2=$(one_line_pem $3)
    local CP2=$(one_line_pem $4)
    local ORDERERPEM=$(one_line_pem $5)
    
    sed -e "s#\${ORG1PEERPEM}#$PP1#" \
        -e "s#\${CA1PEM}#$CP1#" \
        -e "s#\${ORG2PEERPEM}#$PP2#" \
        -e "s#\${CA2PEM}#$CP2#" \
        -e "s#\${ORDERERPEM}#$ORDERERPEM#" \
        connection-profile-template.json
}

function yaml_ccp {
    local PP1=$(one_line_pem $1)
    local CP1=$(one_line_pem $2)
     local PP2=$(one_line_pem $3)
    local CP2=$(one_line_pem $4)
    local ORDERERPEM=$(one_line_pem $5)
    
    sed -e "s#\${ORG1PEERPEM}#$PP1#" \
        -e "s#\${CA1PEM}#$CP1#" \
        -e "s#\${ORG2PEERPEM}#$PP2#" \
        -e "s#\${CA2PEM}#$CP2#" \
        -e "s#\${ORDERERPEM}#$ORDERERPEM#" \
        connection-profile-template.yaml | sed -e $'s/\\\\n/\\\n        /g'
}


ORG1PEERPEM=crypto-config/peerOrganizations/org1.example.com/tlsca/tlsca.org1.example.com-cert.pem
CA1PEM=crypto-config/peerOrganizations/org1.example.com/ca/ca.org1.example.com-cert.pem

ORG2PEERPEM=crypto-config/peerOrganizations/org2.example.com/tlsca/tlsca.org2.example.com-cert.pem
CA2PEM=crypto-config/peerOrganizations/org2.example.com/ca/ca.org2.example.com-cert.pem

ORDERERPEM=crypto-config/ordererOrganizations/example.com/orderers/orderer.example.com/tls/ca.crt
echo "$(yaml_ccp $ORG1PEERPEM $CA1PEM $ORG2PEERPEM $CA2PEM $ORDERERPEM)" > connection-profile.yaml
echo "$(json_ccp $ORG1PEERPEM $CA1PEM $ORG2PEERPEM $CA2PEM $ORDERERPEM)" > connection-profile.json