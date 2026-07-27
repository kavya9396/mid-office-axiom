import { normalizeMastersData } from "./masterDataSession";

describe("normalizeMastersData", () => {
  it("does not map requirement_mst into requirementManagement rows", () => {
    const masters = normalizeMastersData({
      data: {
        requirement_mst: [
          {
            code: "FIN001",
            description: "Synthetic income proof requirement",
            requirementType: "External",
            requirementCategory: "Non-Medical",
            requirementSubCategory: "Financial",
            special: "N",
            raisingAuthority: "UW",
          },
          {
            code: "NMC001",
            description: "Synthetic non-medical clarification requirement",
            requirementType: "Internal",
            requirementCategory: "Non-Medical",
            requirementSubCategory: "Clarification",
            special: "Y",
            raisingAuthority: "OPS",
          },
        ],
      },
    });

    expect(masters.requirementManagement).toBeUndefined();
  });

  it("leaves existing requirementManagement master payload unchanged", () => {
    const masters = normalizeMastersData({
      data: {
        requirementManagement: [
          {
            team: "UW",
            category: "Old Category",
            subCategory: "Old Sub Category",
            document: "Old Document",
            reason: "Old Reason",
            fupCode: "OLD",
            description: "Old Description",
          },
        ],
      },
    });

    expect(masters.requirementManagement).toHaveLength(1);
    expect(masters.requirementManagement?.[0]).toMatchObject({
      fupCode: "OLD",
      category: "Old Category",
      subCategory: "Old Sub Category",
    });
  });
});