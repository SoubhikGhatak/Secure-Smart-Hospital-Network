# 🏥 Secure Smart Hospital Network

### Design and Simulation of a Secure Smart Hospital Network

An interactive network management and cybersecurity simulation platform designed to demonstrate the architecture, implementation, monitoring, and security of a modern hospital network. The project combines enterprise networking concepts with VLAN segmentation, inter-VLAN routing, centralized DHCP services, dedicated server infrastructure, and Access Control Lists (ACLs) to create a structured, scalable, and security-focused hospital network environment.

---

## 📌 Project Overview

Healthcare institutions rely on interconnected digital infrastructure to support administrative operations, patient management systems, laboratory services, communication, and information exchange between departments. Such environments require reliable network connectivity while maintaining strict separation between sensitive internal resources and external or guest users.

**Secure Smart Hospital Network** addresses these requirements through the design and simulation of a logically segmented hospital network based on Cisco networking architecture.

The project organizes hospital departments into separate Virtual Local Area Networks (VLANs), implements Router-on-a-Stick inter-VLAN routing, provides automatic IP address allocation through DHCP, and establishes a dedicated server network for centralized hospital services.

Security is implemented through Extended Access Control Lists (ACLs), restricting unauthorized Guest VLAN access to sensitive hospital departments and server resources.

Alongside the network architecture, the project includes an interactive web-based management and simulation dashboard that demonstrates network topology, IP address allocation, routing behavior, server infrastructure, security policies, traffic monitoring, and connectivity verification.

The objective is to demonstrate how enterprise networking principles can be applied to build a more organized, manageable, and security-conscious hospital network.

## 🎯 Project Objectives

* Design a structured hospital network with department-wise logical segmentation.
* Implement six independent VLANs for different hospital departments and resources.
* Configure inter-VLAN communication using Router-on-a-Stick architecture.
* Implement DHCP services for automatic IP address allocation.
* Establish a dedicated server VLAN for hospital applications and network services.
* Configure Extended ACLs to restrict unauthorized access to critical internal resources.
* Demonstrate network connectivity, routing decisions, and security enforcement.
* Develop an interactive network management dashboard for visualization and simulation.
* Monitor simulated network traffic and generate security event logs.
* Verify network functionality through connectivity testing and Cisco IOS-style commands.

## 🏗️ Network Architecture

The proposed architecture consists of a Cisco router, a managed Layer 2 switch, departmental client devices, and dedicated hospital servers.

### Network Infrastructure

| Network Component  | Device / Technology | Purpose                       |
| ------------------ | ------------------- | ----------------------------- |
| Router             | Cisco 2911          | Inter-VLAN routing            |
| Switch             | Cisco 2960          | VLAN and trunk management     |
| End Devices        | Departmental PCs    | User connectivity             |
| Application Server | Hospital Server     | Hospital application services |
| DNS Server         | DNS Server          | Domain name resolution        |
| Backup Server      | Backup Server       | Backup infrastructure         |
| Routing            | Router-on-a-Stick   | Communication between VLANs   |
| Switching          | IEEE 802.1Q         | VLAN trunking                 |
| Security           | Extended ACL        | Network access control        |

### Network Architecture Flow

```text
                  HOSPITAL-R1
                 Cisco Router
                       |
                 802.1Q Trunk
                       |
                  HOSPITAL-SW1
                  Cisco Switch
                       |
       +---------------+----------------+
       |               |                |
    VLAN 10          VLAN 20          VLAN 30
 Administration     Reception       Medical/Doctors
       |               |                |
      PCs             PCs              PCs

       +---------------+----------------+
       |               |                |
    VLAN 40          VLAN 50          VLAN 60
  Laboratory          Guest        Hospital Servers
       |               |                |
      PCs             PCs       Application/DNS/Backup
```

## 🔀 VLAN Segmentation and IP Addressing

The hospital network is divided into six VLANs to provide logical separation between departments and centralized resources.

| VLAN ID | Department        | Network Address | Default Gateway |
| ------- | ----------------- | --------------- | --------------- |
| 10      | Administration    | 192.168.10.0/24 | 192.168.10.1    |
| 20      | Reception         | 192.168.20.0/24 | 192.168.20.1    |
| 30      | Medical / Doctors | 192.168.30.0/24 | 192.168.30.1    |
| 40      | Laboratory        | 192.168.40.0/24 | 192.168.40.1    |
| 50      | Guest             | 192.168.50.0/24 | 192.168.50.1    |
| 60      | Hospital Servers  | 192.168.60.0/24 | 192.168.60.1    |

Each VLAN operates within its own logical broadcast domain, helping improve network organization, traffic separation, and access management.

## 🌐 Core Networking Technologies

### 1. Virtual Local Area Network (VLAN)

Six VLANs are configured to separate hospital departments and server resources. This logical segmentation reduces unnecessary broadcast traffic and provides a foundation for department-specific network access policies.

### 2. Inter-VLAN Routing

Router-on-a-Stick architecture enables communication between different VLANs through a single physical router interface configured with multiple 802.1Q subinterfaces.

Configured router gateways:

* G0/0.10 — 192.168.10.1
* G0/0.20 — 192.168.20.1
* G0/0.30 — 192.168.30.1
* G0/0.40 — 192.168.40.1
* G0/0.50 — 192.168.50.1
* G0/0.60 — 192.168.60.1

### 3. Dynamic Host Configuration Protocol (DHCP)

Department-specific DHCP pools provide automatic IP address allocation to client devices.

Configured pools:

* ADMIN
* RECEPTION
* MEDICAL
* LAB
* GUEST

The DHCP configuration provides the appropriate IP address, subnet mask, and default gateway according to the client's VLAN.

### 4. Dedicated Server Infrastructure

A separate server VLAN (VLAN 60) provides centralized network services.

| Server       | IP Address    | Function               |
| ------------ | ------------- | ---------------------- |
| HOSPITAL-SRV | 192.168.60.10 | Hospital application   |
| DNS-SRV      | 192.168.60.11 | Domain name resolution |
| BACKUP-SRV   | 192.168.60.12 | Backup infrastructure  |

This separation places critical server resources within a dedicated network segment.

### 5. Access Control Lists (ACL)

An Extended ACL named `GUEST_ISOLATION` implements network-level access restrictions.

The security policy prevents devices in the Guest VLAN (192.168.50.0/24) from accessing:

* Administration Network
* Reception Network
* Medical Network
* Laboratory Network
* Hospital Server Network

The ACL is applied inbound on the Guest router subinterface, providing controlled access to internal hospital resources.

## 🛡️ Cybersecurity Implementation

Security is a fundamental aspect of the proposed architecture.

The project demonstrates the following security principles:

* **Network Segmentation:** Separating departments into independent logical networks.
* **Access Control:** Restricting unauthorized communication through ACL rules.
* **Guest Network Isolation:** Preventing guest devices from accessing sensitive hospital resources.
* **Server Segmentation:** Keeping centralized application and infrastructure servers in a dedicated VLAN.
* **Controlled Communication:** Allowing network traffic according to configured access policies.
* **Security Monitoring:** Recording simulated permitted and blocked network activities.

## 💻 Interactive Network Management Dashboard

In addition to the Cisco Packet Tracer network design, the project includes a web-based interface intended to provide interactive visualization and demonstration of the hospital network.

### Major Dashboard Modules

| Module                | Functionality                                               |
| --------------------- | ----------------------------------------------------------- |
| Overview Dashboard    | Network health, device status, VLAN statistics and activity |
| Network Topology      | Interactive router, switch, client and server visualization |
| VLAN Management       | VLAN configuration and department assignment                |
| IP Address Management | IP allocation and subnet information                        |
| DHCP Management       | Dynamic IP assignment and lease monitoring                  |
| Routing Management    | Router interfaces, gateways and routing information         |
| Server Infrastructure | Hospital application, DNS and backup service demonstration  |
| Security & ACL        | Access-control rules and traffic permission evaluation      |
| Traffic Monitoring    | Simulated network traffic and protocol statistics           |
| Connectivity Testing  | Ping, traceroute, DNS, DHCP, routing and ACL testing        |
| Network Configuration | Cisco IOS-style command simulation                          |
| System Logs           | Network events, security alerts and activity history        |
| Documentation         | Network architecture and project documentation              |

### Interactive Simulation Capabilities

The dashboard is designed to demonstrate:

* Department-wise network topology.
* Client IP address allocation.
* VLAN-based device separation.
* Packet forwarding between VLANs.
* Router-based traffic forwarding.
* ACL-based permit and deny decisions.
* Hospital server accessibility.
* Guest network isolation.
* Simulated network traffic generation.
* Connectivity testing and diagnostic results.
* Cisco IOS-style configuration verification.

The dashboard uses a browser-based simulation model. It is intended for educational demonstration and does not represent a live connection to physical Cisco networking equipment.

## 🧪 Testing and Verification

The network design includes functional and security validation scenarios.

| Test Scenario                | Expected Outcome                                       |
| ---------------------------- | ------------------------------------------------------ |
| VLAN Verification            | All six VLANs configured correctly                     |
| Trunk Verification           | Required VLANs carried through the trunk               |
| DHCP Assignment              | Clients receive appropriate IP configuration           |
| Inter-VLAN Routing           | Authorized internal communication succeeds             |
| Hospital Server Connectivity | Internal clients can reach hospital services           |
| DNS Verification             | Configured DNS records resolve correctly               |
| Web Application Access       | Hospital application service is accessible             |
| Guest Network Isolation      | Guest access to protected internal networks is blocked |
| ACL Verification             | Configured permit and deny rules are enforced          |
| Routing Table Verification   | All configured VLAN networks are represented           |

### Cisco IOS Verification Commands

```bash
show vlan brief
show interfaces trunk
show ip interface brief
show ip route
show ip dhcp binding
show access-lists
show running-config
```

These commands are used as configuration and verification references for the Cisco network implementation.

## 🛠️ Technology Stack

**Networking & Infrastructure**

* Cisco Packet Tracer
* Cisco IOS configuration concepts
* VLAN
* IEEE 802.1Q
* Router-on-a-Stick
* DHCP
* Extended ACL
* IPv4 addressing and subnetting

**Web Application & Simulation**

* React.js
* TypeScript
* Modern CSS
* SVG / Canvas network visualization
* Lucide Icons
* Browser-based simulation logic
* Local storage

**AI-Assisted Development**

* Google AI Studio

## 📚 Learning Outcomes

This project demonstrates practical understanding of:

* Enterprise network architecture and design.
* VLAN creation and switch port configuration.
* Inter-VLAN routing and 802.1Q trunking.
* IPv4 subnetting and IP address management.
* DHCP configuration and dynamic address allocation.
* Centralized server infrastructure.
* Extended ACL configuration and traffic filtering.
* Network troubleshooting and connectivity verification.
* Cybersecurity-oriented network segmentation.
* Interactive network monitoring and simulation development.

## 🚀 Future Scope

The architecture can be extended with additional enterprise networking and security capabilities, including:

* Next-generation firewall integration.
* Intrusion Detection and Prevention Systems (IDS/IPS).
* Network Access Control (NAC).
* Role-based departmental access policies.
* Secure remote access through VPN.
* Network redundancy and high availability.
* Centralized SIEM integration.
* Advanced network analytics and anomaly detection.
* Real-time monitoring through supported network telemetry.
* Secure wireless infrastructure for hospital IoT devices.
* Integration with healthcare information systems.

## ⚠️ Project Scope and Limitations

This project is an educational network design and simulation initiative.

The Cisco Packet Tracer architecture represents the proposed network configuration, while the web dashboard provides a separate interactive demonstration of its logical operation.

Browser-based simulation results and generated traffic are illustrative and should not be interpreted as live packet captures, actual network telemetry, or verified physical-device configurations.

The application does not process real patient information or provide a production-ready hospital information system.

Actual deployment in a healthcare environment would require additional security controls, infrastructure validation, privacy safeguards, redundancy, and compliance assessments.

## 👨‍💻 Project Information

**Project Title:** Design and Simulation of a Secure Smart Hospital Network

**Domain:** Computer Networking | Cybersecurity | Network Administration

**Platform:** Cisco Packet Tracer and Web-Based Simulation Dashboard

**Project Type:** Academic / Project-Based Learning (PBL)

**Institution:** Brainware University

**Author:** Soubhik Ghatak

---

### Final Note

The Secure Smart Hospital Network project demonstrates how structured network architecture, department-wise segmentation, centralized network services, and access-control mechanisms can work together to create a more manageable and security-conscious healthcare networking environment.

**CONNECT • SEGMENT • ROUTE • MONITOR • PROTECT**
