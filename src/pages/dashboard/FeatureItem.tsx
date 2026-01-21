const FeatureItem = ({ title, icon }: { title: string; icon: string }) => (
  <div className="text-center text-white">
    <div className="w-20 h-20 mx-auto rounded-full bg-white text-3xl flex items-center justify-center mb-3">{icon}</div>
    <p className="font-medium">{title}</p>
  </div>
);
export default FeatureItem;
