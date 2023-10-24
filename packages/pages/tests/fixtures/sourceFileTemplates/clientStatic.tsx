const Static: Template<ExternalImageRenderData> = ({ externalImage }) => {
  return (
    <>
      <PageLayout>
        <Banner name={"Turtlehead Tacos"} />
        <div className="centered-container">
          <div className="section space-y-14 px-10">
            <Card {...externalImage} />
          </div>
        </div>
      </PageLayout>
    </>
  );
};
type ExternalImageRenderData = TemplateRenderProps & {
  externalImage: ExternalImage;
};

export default Static;
