import { Template, TemplateRenderProps } from "@yext/pages";
import { isProduction } from "@yext/pages/util";
import Banner from "../components/Banner";
import Breadcrumbs from "../components/Breadcrumbs";
import DirectoryStateGrid from "../components/DirectoryStateGrid";
import EditTool from "../components/EditTool";
import PageLayout from "../components/PageLayout";
import "../index.css";

const State: Template<TemplateRenderProps> = ({
  relativePrefixToRoot,
  document,
}) => {
  const {
    name,
    description,
    siteDomain,
    c_addressRegionDisplayName,
    dm_directoryParents,
    dm_directoryChildren,
  } = document;

  return (
    <>
      <PageLayout>
        <Banner
          name={c_addressRegionDisplayName ? c_addressRegionDisplayName : name}
        />
        <div className="centered-container">
          <Breadcrumbs
            breadcrumbs={dm_directoryParents}
            baseUrl={relativePrefixToRoot}
          />
          <DirectoryStateGrid
            name={
              c_addressRegionDisplayName ? c_addressRegionDisplayName : name
            }
            description={description}
            directoryChildren={dm_directoryChildren}
            relativePrefixToRoot={relativePrefixToRoot}
          />
        </div>
      </PageLayout>
      {/* This component displays a link to the entity that represents the given page in the Knowledge Graph*/}
      {!isProduction(siteDomain) && <EditTool data={document} />}
    </>
  );
};

export default State;
