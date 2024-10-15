import AnimationWrapper from "../common/page-animation"
import InpageNavigation from "../components/inpage-navigation.component"


const Homepage = () => {
    return (
        <AnimationWrapper>
            <section className="h-cover flex justify-center gap-10">
{/* latest blogs */}
                <div className="w-full">

                    <InpageNavigation routes={["home","trending blogs"]}>

                    </InpageNavigation>
                    
                </div>
{/* filtert and trendign blogs */}
                <div>

                </div>
                
            </section>
        </AnimationWrapper>
    )
}
export default Homepage