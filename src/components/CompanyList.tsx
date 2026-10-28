/* import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
export default function CompanyList() {
  const navigate = useNavigate();

  const companies = [
  {"id": 1,
    "title": "Nordic Cloud Systems AB",
    "phone_number": "+46 8 123 456 01",
    "industry_type": "Cloud Computing",
    "email": "contact@nordiccloud.example",
    "contact": "Anna Lindström",
    "org_number": "556123-7890",
    "is_active": true
  },
  {
    "id": 2,
    "title": "Stockholm Data Forge",
    "phone_number": "+46 8 234 567 02",
    "industry_type": "Data Analytics",
    "email": "hello@dataforge.example",
    "contact": "Erik Johansson",
    "org_number": "556234-8901",
    "is_active": true
  },
  {"id": 3,
    "title": "Arctic Software Solutions",
    "phone_number": "+46 8 345 678 03",
    "industry_type": "Software Development",
    "email": "info@arcticsoft.example",
    "contact": "Sofia Karlsson",
    "org_number": "556345-9012",
    "is_active": false
  },
  {"id": 4,
    "title": "Helix AI Systems",
    "phone_number": "+46 8 456 789 04",
    "industry_type": "Artificial Intelligence",
    "email": "support@helixai.example",
    "contact": "Johan Eriksson",
    "org_number": "556456-0123",
    "is_active": true
  },
  {"id": 5,
    "title": "Baltic Cyber Defense",
    "phone_number": "+46 8 567 890 05",
    "industry_type": "Cybersecurity",
    "email": "security@balticcyber.example",
    "contact": "Mikael Berg",
    "org_number": "556567-1234",
    "is_active": true
  },
  {"id": 6,
    "title": "Greenline Energy Tech",
    "phone_number": "+46 8 678 901 06",
    "industry_type": "Renewable Energy",
    "email": "info@greenline.example",
    "contact": "Elin Sjöberg",
    "org_number": "556678-2345",
    "is_active": true
  },
  {"id": 7,
    "title": "Nordic Health Systems",
    "phone_number": "+46 8 789 012 07",
    "industry_type": "Healthcare IT",
    "email": "contact@nhs.example",
    "contact": "Karin Andersson",
    "org_number": "556789-3456",
    "is_active": false
  },
  {"id": 8,
    "title": "Falcon Logistics Group",
    "phone_number": "+46 8 890 123 08",
    "industry_type": "Logistics",
    "email": "ops@falconlogistics.example",
    "contact": "Henrik Svensson",
    "org_number": "556890-4567",
    "is_active": true
  },
  {"id": 9,
    "title": "BluePeak Fintech",
    "phone_number": "+46 8 901 234 09",
    "industry_type": "Financial Technology",
    "email": "support@bluepeak.example",
    "contact": "Emma Lindqvist",
    "org_number": "556901-5678",
    "is_active": true
  },
  {"id": 10,
    "title": "Aurora Digital Studios",
    "phone_number": "+46 8 012 345 10",
    "industry_type": "Digital Media",
    "email": "hello@aurorastudios.example",
    "contact": "David Nilsson",
    "org_number": "557012-6789",
    "is_active": true
  },
  {"id": 11,
    "title": "IronGate Manufacturing",
    "phone_number": "+46 8 123 456 11",
    "industry_type": "Manufacturing",
    "email": "contact@irongate.example",
    "contact": "Peter Lund",
    "org_number": "557123-7891",
    "is_active": true
  },
  {"id": 12,
    "title": "NorthStar Robotics",
    "phone_number": "+46 8 234 567 12",
    "industry_type": "Robotics",
    "email": "info@northstar.example",
    "contact": "Linda Holm",
    "org_number": "557234-8902",
    "is_active": false
  },
  {"id": 13,
    "title": "Viking Software Group",
    "phone_number": "+46 8 345 678 13",
    "industry_type": "Enterprise Software",
    "email": "support@vikingsoft.example",
    "contact": "Oskar Bergström",
    "org_number": "557345-9013",
    "is_active": true
  },
  {"id": 14,
    "title": "Skyline Cloud Services",
    "phone_number": "+46 8 456 789 14",
    "industry_type": "Cloud Services",
    "email": "hello@skylinecloud.example",
    "contact": "Nina Forsberg",
    "org_number": "557456-0124",
    "is_active": true
  },
  {"id": 15,
    "title": "Polar Data Networks",
    "phone_number": "+46 8 567 890 15",
    "industry_type": "Networking",
    "email": "contact@polardata.example",
    "contact": "Anders Nilsson",
    "org_number": "557567-1235",
    "is_active": true
  },
  {"id": 16,
    "title": "Quantum Edge Labs",
    "phone_number": "+46 8 678 901 16",
    "industry_type": "Quantum Computing",
    "email": "info@quantumedge.example",
    "contact": "Sara Ekström",
    "org_number": "557678-2346",
    "is_active": false
  },
  {"id": 17,
    "title": "Evergreen BioTech",
    "phone_number": "+46 8 789 012 17",
    "industry_type": "Biotechnology",
    "email": "support@evergreenbio.example",
    "contact": "Lars Pettersson",
    "org_number": "557789-3457",
    "is_active": true
  },
  {"id": 18,
    "title": "Metro Analytics Hub",
    "phone_number": "+46 8 890 123 18",
    "industry_type": "Business Intelligence",
    "email": "hello@metroanalytics.example",
    "contact": "Julia Nyström",
    "org_number": "557890-4568",
    "is_active": true
  },
  {"id": 19,
    "title": "Cobalt Security Group",
    "phone_number": "+46 8 901 234 19",
    "industry_type": "Cybersecurity",
    "email": "security@cobalt.example",
    "contact": "Fredrik Olsson",
    "org_number": "557901-5679",
    "is_active": true
  },
  {"id": 20,
    "title": "Aurora Mobility Solutions",
    "phone_number": "+46 8 012 345 20",
    "industry_type": "Automotive Technology",
    "email": "info@auroramobility.example",
    "contact": "Maja Karlsson",
    "org_number": "558012-6780",
    "is_active": false
  }
];


function handleCompanyNav(companyId: number) {

   navigate(`/company/${companyId}`);
  }

  return (

      <div>
        {companies.filter(company => company.is_active).map((company) => (
          <div style={{ display: "flex", flexDirection: "row", alignItems: "center", height: "100%" }} key={company.id}>
          <div className="company-card" style={{ border: "1px solid var(--line)", margin: "10px 0", padding: "0 10px", borderRadius: "var(--radius-lg)", background: "var(--surface)", boxShadow: "var(--shadow-sm)", height:"fit-content", width: "100%" }} key={company.org_number}>
            <h4 onClick={() =>handleCompanyNav(company.id)} className="company-title" style={{ margin: 0, textDecoration: "underline", cursor: "pointer" }}>{company.title}</h4>
            <p className="company-industry" style={{ margin: "5px 0" }}>Industry: {company.industry_type}</p>
            <p className="company-org-number" style={{ margin: "5px 0" }}>Org Nr: {company.org_number}</p>
          </div>
          <div onClick={() => handleCompanyNav(company.id)} style={{ height: "85px", width: "fit-content", display: "flex", backgroundColor: "var(--line-soft)", alignItems: "center" }}>
            <ArrowRight/>
          </div>
          </div>
        ))}
      </div>
  );
}
 */
