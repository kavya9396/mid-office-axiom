export const OPEN_REQUIREMENT_MANAGEMENT_EVENT = "openRequirementManagement";

export const openRequirementManagement = (openAddRequirement = false) => {
    window.dispatchEvent(
        new CustomEvent(OPEN_REQUIREMENT_MANAGEMENT_EVENT, {
            detail: { openAddRequirement },
        }),
    );
};

export type OpenRequirementManagementEvent = CustomEvent<{
    openAddRequirement?: boolean;
}>;